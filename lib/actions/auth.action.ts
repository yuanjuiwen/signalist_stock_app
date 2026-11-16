'use server';


import { auth } from "@/lib/better-auth/auth";
import {inngest} from "@/lib/inngest/client";
import { checkSignInLimits } from "@/lib/auth-rate-limit";
import { headers } from "next/headers";

export const signUpWithEmail = async ( { email, password, fullName, country, investmentGoals, riskTolerance, preferredIndustry }: SignUpFormData) => {
    try{
        //call better Auth
       const response = await auth.api.signUpEmail({ body: { email, password, name: fullName } })

        if(response) {
            try {
                await inngest.send({
                    name: 'app/user.created',
                    data: { email, name: fullName, country, investmentGoals, riskTolerance, preferredIndustry }
                })
            } catch {
                console.error('Welcome event delivery failed after successful signup');
            }
        }

        return { success: true, data: response }

    }catch(e){
        console.log('sign up failed',e)
        return {success: false, error: 'sign up failed'}
    }
}

export const signOut = async () => {
    try{
        await auth.api.signOut({ headers: await headers()});
    }catch (e) {
        console.log("Sign out failed", e)
        return { success: false, error: 'sign out failed'}
    }
} 

export const signInWithEmail = async ( { email, password}: SignInFormData) => {
    try{
        const requestHeaders = await headers();
        if (!(await checkSignInLimits(requestHeaders, email))) {
            return { success: false, error: 'Too many sign-in attempts. Please try again later.' };
        }
        const response = await auth.api.signInEmail({ body: { email, password }, headers: requestHeaders })

      

        return { success: true, data: response }

    }catch(e){
        console.log('sign in failed',e)
        return {success: false, error: 'sign in failed'}
    }
}