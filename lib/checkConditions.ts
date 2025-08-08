export const checkConditions = (
  values: any,
  conditions: any,
  type = 'and',
  taskDetails: Record<string, any>,
): boolean => {
  if (!conditions || Object.keys(conditions).length < 1) return true
  let res = true
  if (type === 'and') {
    res = Object.entries<string[]>(conditions).every(
      ([key, value]: [string, any[]]) => {
        const isTaskDetails = key.startsWith('td-')
        const currentValues = isTaskDetails ? taskDetails : values

        if (key.includes('__or-')) {
          return checkConditions(currentValues, value, 'or', taskDetails)
        } else if (key.includes('__and')) {
          return checkConditions(currentValues, value, 'and', taskDetails)
        } else {
          const newFormValue: string | string[] = currentValues[key]
          const formValue =
            newFormValue != undefined
              ? Array.isArray(newFormValue)
                ? newFormValue.map((val) => `${val}`.toLowerCase())
                : `${newFormValue}`.toLowerCase()
              : newFormValue
          return value.some((item) => {
            if (item === '!null') {
              return Array.isArray(formValue) ? formValue.length : formValue
            } else if (item.__and) {
              return item.__and.every((val: any) => {
                const bool = Array.isArray(formValue)
                  ? formValue.includes(val)
                  : `${formValue}` == `${val}`
                return bool
              })
            } else {
              const newItem = item != undefined ? `${item}`.toLowerCase() : item
              if (Array.isArray(formValue))
                return formValue.includes(`${newItem}`)
              return `${formValue}` == `${newItem}`
            }
          })
        }
      },
    )
  } else if (type === 'or') {
    res = Object.entries<string[]>(conditions).some(
      ([key, value]: [string, any[]]) => {
        const isTaskDetails = key.startsWith('td-')
        const currentValues = isTaskDetails ? taskDetails : values
        if (key.includes('__or-')) {
          return checkConditions(currentValues, value, 'or', taskDetails)
        } else if (key.includes('__and')) {
          return checkConditions(currentValues, value, 'and', taskDetails)
        } else {
          const newFormValue: string | string[] = currentValues[key]
          const formValue =
            newFormValue != undefined
              ? Array.isArray(newFormValue)
                ? newFormValue.map((val) => `${val}`.toLowerCase())
                : `${newFormValue}`.toLowerCase()
              : newFormValue
          return value.some((item) => {
            if (item === '!null') {
              return Array.isArray(formValue) ? formValue.length : formValue
            } else if (item.__and) {
              return item.__and.every((val: any) => {
                const bool = Array.isArray(formValue)
                  ? formValue.includes(val)
                  : `${formValue}` == `${val}`
                return bool
              })
            } else {
              const newItem = item != undefined ? `${item}`.toLowerCase() : item
              if (Array.isArray(formValue))
                return formValue.includes(`${newItem}`)
              return `${formValue}` == `${newItem}`
            }
          })
        }
      },
    )
  }
  return res
}
