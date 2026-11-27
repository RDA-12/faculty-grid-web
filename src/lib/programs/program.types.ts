export enum ProgramDegreeLevel {
  bachelor = 'bachelor',
  master = 'master',
  doctorate = 'doctorate',
}

export type Program = {
  id: string
  name: string
  degreeLevel: ProgramDegreeLevel
  facultyId: string
}
