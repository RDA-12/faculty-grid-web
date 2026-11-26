import { ISettingsParam, Logger } from 'tslog'

const root = new Logger({
  type: process.env.NODE_ENV === 'test' ? 'hidden' : 'pretty',
  name: 'FacultyGrid',
  pretty: {
    template: '[{{dateIsoStr}}] [{{logLevelName}}] [{{name}}] ',
    timeZone: 'local',
  },
  mask: {
    keys: ['password', 'authorization'],
    paths: ['*.accessToken', '*.refreshToken'],
    caseInsensitive: true,
    placeholder: '[REDACTED]',
  },
})

export function getLogger(
  name: string,
  settings?: Omit<ISettingsParam<unknown>, 'name'>,
) {
  return root.getSubLogger({ name: name, ...settings })
}
