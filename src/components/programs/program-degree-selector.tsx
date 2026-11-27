import { ProgramDegreeLevel } from '@/lib/programs/program.types'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

type ProgramDegreeSelectorProps = {
  value?: ProgramDegreeLevel
  onValueChange?: (degreeLevel?: ProgramDegreeLevel) => void
}

export default function ProgramDegreeSelector({
  value,
  onValueChange,
}: ProgramDegreeSelectorProps) {
  return (
    <Select
      value={value ?? ''}
      onValueChange={(v) => {
        const val = v as ProgramDegreeLevel
        if (onValueChange) {
          onValueChange(val)
        }
      }}
    >
      <SelectTrigger className="w-full max-w-48">
        <SelectValue placeholder="Pilih tingkat pendidikan" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Tingkat Pendidikan</SelectLabel>
          <SelectItem value="bachelor">S1 - Sarjana</SelectItem>
          <SelectItem value="master">S2 - Magister</SelectItem>
          <SelectItem value="doctorate">S3 - Doktor</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
