'use client'

import { useState } from 'react'
import { useDebounce } from 'use-debounce'
import { useFaculties } from '@/lib/faculties/faculties.hook'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '../ui/combobox'
import type { Faculty } from '@/lib/faculties/faculty.types'

type FacultiesComboboxProps = {
  value?: Faculty | null
  onValueChange?: (faculty?: Faculty | null) => void
}

export default function FacultiesCombobox({
  value,
  onValueChange,
}: FacultiesComboboxProps) {
  const [search, setSearch] = useState<string | undefined>()
  const [searchQuery] = useDebounce(search, 500)
  const { faculties } = useFaculties(undefined, { search: searchQuery })

  return (
    <Combobox<Faculty>
      autoHighlight
      items={faculties?.data ?? []}
      itemToStringLabel={(it) => it.name}
      {...(value !== undefined ? { value } : {})}
      onValueChange={(e) => {
        if (onValueChange) {
          onValueChange(e)
        }
      }}
    >
      <ComboboxInput
        id="Pilih fakultas"
        aria-label="Pilih fakultas"
        placeholder="Pilih fakultas"
        showClear
        onChangeCapture={(e) => {
          const val = e.target.value
          setSearch(val)
        }}
      />
      <ComboboxContent>
        <ComboboxEmpty>Tidak ada fakultas yang ditemukan</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.id} value={item}>
              {item.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
