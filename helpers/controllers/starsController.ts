import type { LoggedRequest } from '../../@types/helpers'
import type { SetStarMutation, SetStarMutationVariables } from '../../graphql'
import { prisma } from '../../prisma'
import { validateLessonId } from '../validateLessonId'
import { validateStudentId } from '../validation/validateStudentId'
import { sendLessonChannelMessage } from '../discordBot'

export const setStar = async (
  _parent: void,
  arg: SetStarMutationVariables,
  ctx: { req: LoggedRequest }
): Promise<SetStarMutation['setStar']> => {
  const { req } = ctx
  try {
    const studentId = validateStudentId(req)
    const { lessonId, mentorId } = arg

    if (studentId === mentorId) {
      throw new Error('Unable to give star to yourself')
    }
    await validateLessonId(lessonId)
    const starData = { studentId, ...arg }

    const { mentor } = await prisma.star.upsert({
      where: {
        studentId_lessonId: {
          studentId,
          lessonId
        }
      },
      create: starData,
      update: starData,
      select: {
        mentor: {
          select: {
            username: true
          }
        }
      }
    })

    // TODO: Add support for discord ids when oauth implementation is complete

    await sendLessonChannelMessage(
      lessonId,
      `**${mentor.username}** received a star!`
    )

    return { success: true }
  } catch (err) {
    req.error(`Failed to add Star into Database: ${err}`)
    throw new Error(err)
  }
}
