import moment from 'moment-timezone'

const toIsraelTime = (dateString: string) => {
  const utcMoment = moment.utc(dateString)
  return utcMoment.clone().tz('Asia/Jerusalem')
}

export default toIsraelTime
