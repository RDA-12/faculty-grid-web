import { RankType } from '@/lib/rank/rank.types'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

type RankTypeSelectorProps = {
  value?: RankType
  onValueChange?: (type?: RankType) => void
}

export default function RankTypeSelector({
  value,
  onValueChange,
}: RankTypeSelectorProps) {
  return (
    <Select
      value={value ?? ''}
      onValueChange={(v) => {
        const val = v as RankType
        if (onValueChange) {
          onValueChange(val)
        }
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Pilih jenis pangkat/golongan" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Jenis Pangkat/Golongan</SelectLabel>
          <SelectItem value={RankType.asn}>ASN</SelectItem>
          <SelectItem value={RankType.military}>Militer</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
