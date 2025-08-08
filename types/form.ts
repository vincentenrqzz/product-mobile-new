import { Task } from '@/store/tasks'

export type FormField = {
  _id: string
  key: string
  inputType: FormFieldTypes
  note: string
  validation: string
  label: string
  description: string
  placeholder: string
  options?: Record<string, any>
  defaultValue: string
  value: any
  displayValue: string
  taskDetailKey?: string
  autocompleteKey?: string
  autocompleteTable?: string
  layout?: string
}

export type ParsedFormField = FormField & {
  rules: {
    required: boolean
    actions: string[]
  }
  conditions: Record<string, string[]>
  uniqueId?: any
  videoDurationLimit: number
  captureMode: object
  itemLimit: number
  gallery?: boolean
}

export type Form = {
  _id: string
  key: string
  description: string
  formFields: ParsedFormField[]
}

export type GetQueryResultParams = {
  type: string
  query: Record<string, any>
}

export enum FormFieldTypes {
  ACCORDION = 'droppableAccordion',
  MARKUP = 'markup',
  PRINT = 'printButton',
  TEXT = 'text',
  TEXTAREA = 'textarea',
  BUTTON = 'button',
  DATE_TIME_REGISTER = 'dateTimeRegister',
  DATE_PICKER = 'datePicker',
  DATE_TIME_PICKER = 'dateTimePicker',
  CAMERA_BUTTON = 'cameraButton',
  DROPDOWN = 'dropdown',
  AUTOCOMPLETE = 'autocomplete',
  RADIO = 'radios',
  SURVEY = 'survey',
  CHECKBOXES = 'checkboxes',
  ATTACH_BUTTON = 'attachButton',
  SIGNATURE = 'signature',
  GEO = 'geo',
  ASSIGNED = 'assigned',
}

export type CreateComponentProps = {
  form: ParsedFormField[]
  item: ParsedFormField
  index: number
  onChange: (key: string, value: any, id: any, newFormVal?: any) => any
  task: Task
  value: any
  error?: string
  currentFormValues: Record<string, any>
  scrollTo: ({
    index,
    top,
    id,
  }: {
    index?: number
    top?: boolean
    id?: string
  }) => void
  accordionData?: ParsedFormField
  focusComp?: (index: number) => any
  taskDetails?: any
  onFocus?: () => void
}
