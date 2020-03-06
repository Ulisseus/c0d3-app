import React from 'react'
import { CheckCircle } from 'react-feather'

import '../scss/lessonCard.scss'

type Props = {
  coverImg: string
  title: string
  challengeCount: number
  lessonCount: number
  hourCount: string | number
  description: string
  currentState?: string
}

const LessonCard: React.FC<Props> = props => {
  const containerClass =
    props.currentState === 'inProgress'
      ? 'lesson-card__container_inprogress card shadow-sm mt-3 border-primary'
      : 'card shadow-sm mt-3'
  return (
    <div className={containerClass}>
      <div className="card-body p-2">
        <div className="row no-gutters">
          {props.currentState === 'completed' && (
            <span className="badge badge-pill badge-success position-absolute lesson-card__container_completed">
              <CheckCircle style={{ height: '15px', marginTop: '-2px' }} />
              <span className="mr-1">COMPLETED</span>
            </span>
          )}
          <div className="mw-100 col-2 mr-4">
            <img
              src={`/curriculumAssets/lessonCoversSvg/${props.coverImg}`}
              alt={props.coverImg}
            />
          </div>
          <div className="col-9">
            <h4 className="lesson-card__title font-weight-bold mt-3">
              {props.title}
            </h4>
            <div>
              <div className="d-inline-block mr-4">
                <img
                  className="mr-1"
                  src="/curriculumAssets/icons/icon-lesson.svg"
                  alt="icon-lessons"
                />
                <span className="lesson-card__icon-text">
                  {props.lessonCount} LESSONS
                </span>
              </div>
              <div className="d-inline-block mr-4">
                <img
                  className="mr-1"
                  src="/curriculumAssets/icons/icon-challenge.svg"
                  alt="icon-challenge"
                />
                <span className="lesson-card__icon-text">
                  {props.challengeCount} CHALLENGES
                </span>
              </div>
              <div className="d-inline-block mr-4">
                <img
                  className="mr-1"
                  src="/curriculumAssets/icons/icon-time.svg"
                  alt="icon-time"
                />
                <span className="lesson-card__icon-text">
                  {props.hourCount} HOURS
                </span>
              </div>
            </div>
            <p className="lesson-card__description mt-2">{props.description}</p>
          </div>
        </div>
      </div>
      {props.currentState === 'inProgress' && (
        <div className="card-footer bg-primary">
          <a
            className="lesson-card__button btn btn-light mr-2 my-1 text-primary"
            href="#"
          >
            Start Lesson
          </a>
          <a
            className="lesson-card__button btn bg-primary my-1 text-white border border-white"
            href="#"
          >
            View Challenges
          </a>
        </div>
      )}
    </div>
  )
}

export default LessonCard