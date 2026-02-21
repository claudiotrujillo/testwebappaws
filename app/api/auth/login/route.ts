import { NextRequest, NextResponse } from 'next/server'
import {
    CognitoIdentityProviderClient,
    InitiateAuthCommand,
    AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider'
import { createHmac } from 'crypto'

const cognitoClient = new CognitoIdentityProviderClient({
    region: process.env.NEXT_PUBLIC_COGNITO_REGION || 'us-east-1',
})

function computeSecretHash(username: string): string {
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!
    const clientSecret = process.env.COGNITO_CLIENT_SECRET!
    return createHmac('sha256', clientSecret)
        .update(username + clientId)
        .digest('base64')
}

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email y contraseña son requeridos' },
                { status: 400 }
            )
        }

        const secretHash = computeSecretHash(email)

        const command = new InitiateAuthCommand({
            AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
            ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password,
                SECRET_HASH: secretHash,
            },
        })

        const response = await cognitoClient.send(command)

        if (response.ChallengeName) {
            if (response.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
                return NextResponse.json({ error: 'Debes cambiar tu contraseña temporal accediendo previamente desde el AWS Hosted UI o la consola CLI, o crear el usuario sin forzar cambio de clave.' }, { status: 401 })
            }
            return NextResponse.json({ error: `Desafío de seguridad pendiente: ${response.ChallengeName}` }, { status: 401 })
        }

        const tokens = response.AuthenticationResult

        if (!tokens?.IdToken) {
            return NextResponse.json({ error: 'Autenticación fallida (No token)' }, { status: 401 })
        }

        // Devolvemos el token al cliente para guardarlo en cookie
        return NextResponse.json({
            idToken: tokens.IdToken,
            accessToken: tokens.AccessToken,
            refreshToken: tokens.RefreshToken,
            email,
        })
    } catch (err: unknown) {
        const error = err as { name?: string; message?: string }
        console.error('Cognito auth error:', error)

        const messages: Record<string, string> = {
            NotAuthorizedException: 'Correo o contraseña incorrectos.',
            UserNotFoundException: 'No existe un usuario con ese correo.',
            UserNotConfirmedException: 'Debes confirmar tu cuenta de email primero.',
            PasswordResetRequiredException: 'Debes cambiar tu contraseña.',
        }

        const msg = messages[error.name ?? ''] ?? error.message ?? 'Error al autenticar'
        return NextResponse.json({ error: msg }, { status: 401 })
    }
}
