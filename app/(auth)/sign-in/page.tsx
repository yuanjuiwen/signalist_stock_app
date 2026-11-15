'use client'
import { Button } from '@base-ui/react';
import React from 'react'
import { useForm } from 'react-hook-form';
import InputField from '@/components/forms/InputField';
import FooterLink from '@/components/forms/FooterLink';

const SignIn = () => {

  const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useForm<SignInFormData>({
  defaultValues: {
    email: '',
    password: '',
  },
  mode: 'onBlur',
})


  const onSubmit = async(data: SignInFormData) => {
    try{
        console.log( data);
    }catch(e){
        console.error( e);
    }
  }

  return (
    <div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
        <InputField
                name="email"
                label="Email"
                placeholder="ray123@gmail.com"
                register={register}
                error={errors.email}
                validation={{ required: 'Email name is required', pattern: /^\w+@\w+\.\w+$/, message: 'Email address is required'}}
        />

        <InputField
                name="password"
                label="Password"
                placeholder="Enter a strong password"
                type="password"
                register={register}
                error={errors.password}
                validation={{ required: 'Full name is required', minlength: 8}}
        />

        <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
                Login
       </Button>

       <FooterLink text="Don't have an account" linkText="Sign up" href="/sign-up"/>

      </form>
    </div>
  )
}

export default SignIn;