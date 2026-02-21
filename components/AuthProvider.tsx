'use client'

import { Amplify } from 'aws-amplify'
import { ReactNode } from 'react'

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
            userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
        },
    },
})

export function AuthProvider({ children }: { children: ReactNode }) {
    return <>{children}</>
}
