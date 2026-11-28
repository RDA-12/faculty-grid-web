export enum RankType {
  asn = 'asn',
  military = 'military',
}

export type Rank = {
  id: string
  name: string
  type: RankType
}
