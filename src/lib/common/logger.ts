import { ISettingsParam, Logger } from 'tslog'

const root = new Logger({
  name: 'FacultyGrid',
})

export function getLogger(
  name: string,
  settings?: Omit<ISettingsParam<unknown>, 'name'>,
) {
  return root.getSubLogger({ name: name, ...settings })
}
