import React from 'react'
import countryList from 'react-select-country-list'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Controller } from 'react-hook-form'

 const CountrySelectField = ( {name, label, control, error, required = false} : CountrySelectProps) => {
    const countries = countryList().getData()
  
    return (
    
    <div>
        <label className='form-label'>
            {label}
        </label>
        
        <Controller 
            name={name}
            control={control}
            rules={{
            required: required? `Please select ${label.toLowerCase()}`:false,
            }}
            
            render={({field }) => (
                <Combobox items={countries} value={field.value} onValueChange={field.onChange}>
                    <ComboboxInput placeholder="Select a country" className="country-select-trigger" />
                        <ComboboxContent  className='w-full p-0 bg-gray-800 border-gray-600'>
                            <ComboboxEmpty className="country-select-empty">No countrys found.</ComboboxEmpty>
                            <ComboboxList>
                                {(country) => (
                                <ComboboxItem key={country.value} value={country} className="country-select-item">
                                    {country.label}
                                </ComboboxItem>
                                )}
                            </ComboboxList>
                        </ComboboxContent>
                </Combobox>

            )}

        />
         {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  )
}

export default CountrySelectField