import { User } from '.prisma/client'
import { Context } from '../../@types/helpers'
import {
  CreateSubmissionMutation,
  MutationAcceptSubmissionArgs,
  MutationCreateSubmissionArgs,
  MutationRejectSubmissionArgs,
  QuerySubmissionsArgs,
  SubmissionStatus
} from '../../graphql'
import { prisma } from '../../prisma'
import { decode } from '../encoding'
import { hasPassedLesson } from '../hasPassedLesson'
import { updateSubmission } from '../updateSubmission'
import { sendSubmissionNotification, IdType } from '../discordBot'

export const createSubmission = async (
  _parent: void,
  args: MutationCreateSubmissionArgs
): Promise<CreateSubmissionMutation['createSubmission']> => {
  try {
    if (!args) throw new Error('Invalid args')
    const { challengeId, cliToken, diff, lessonId } = args
    const { id } = decode(cliToken)
    const previousSubmission = await prisma.submission.findFirst({
      where: {
        challengeId,
        lessonId,
        user: {
          id
        },
        status: SubmissionStatus.Open
      }
    })
    if (previousSubmission) {
      await prisma.submission.update({
        where: {
          id: previousSubmission.id
        },
        data: {
          status: SubmissionStatus.Overwritten
        }
      })
    }
    const submission = await prisma.submission.create({
      data: {
        challengeId,
        lessonId,
        userId: id,
        diff,
        status: SubmissionStatus.Open
      },
      include: {
        challenge: true,
        user: true,
        lesson: true
      }
    })

    const { challenge, user, lesson } = submission

    // TODO: Add support for discord ids when oauth implementation is complete

    // Get next lesson
    const nextLesson = await prisma.lesson.findFirst({
      where: { order: lesson.order + 1 }
    })

    await sendSubmissionNotification(
      IdType.C0D3,
      user.username,
      nextLesson?.id ?? lessonId,
      lessonId,
      challenge.title
    )

    return submission
  } catch (error) {
    throw new Error(error)
  }
}

export const acceptSubmission = async (
  _parent: void,
  args: MutationAcceptSubmissionArgs,
  ctx: Context
) => {
  try {
    if (!args) throw new Error('Invalid args')
    const reviewerId = await getReviewer(ctx.req.user, args.lessonId)
    return updateSubmission({
      ...args,
      reviewerId,
      status: SubmissionStatus.Passed
    })
  } catch (error) {
    throw new Error(error)
  }
}

export const rejectSubmission = async (
  _parent: void,
  args: MutationRejectSubmissionArgs,
  ctx: Context
) => {
  try {
    if (!args) throw new Error('Invalid args')
    const reviewerId = await getReviewer(ctx.req.user, args.lessonId)
    return updateSubmission({
      ...args,
      reviewerId,
      status: SubmissionStatus.NeedMoreWork
    })
  } catch (error) {
    throw new Error(error)
  }
}

export const submissions = async (
  _parent: void,
  arg: QuerySubmissionsArgs,
  ctx: Context
) => {
  try {
    const { lessonId } = arg
    await getReviewer(ctx.req.user, lessonId)
    return prisma.submission.findMany({
      where: {
        status: SubmissionStatus.Open,
        lessonId: lessonId
      },
      include: {
        challenge: true,
        user: true,
        reviewer: true,
        comments: {
          include: {
            author: true
          }
        }
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}

export const getReviewer = async (
  user: User | null,
  lessonId: number
): Promise<number> => {
  const reviewerId = user?.id
  if (!reviewerId) throw new Error('Invalid user')
  if (!(await hasPassedLesson(reviewerId, lessonId))) {
    throw new Error('User has not passed this lesson and cannot review.')
  }
  return reviewerId
}
