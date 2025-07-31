const removeUrgentFromDetails = (detailsArr: any[]) => {
  return detailsArr.filter((item) => item.key !== 'urgentTask')
}

export default removeUrgentFromDetails
