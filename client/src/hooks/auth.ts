'use client'

import useSWR from 'swr'
import axios from '@/lib/axios'
import { useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'

/**
 * Senior-level User interface for strict typing.
 */
interface User {
    id: string
    name: string
    email: string
    email_verified_at?: string
    [key: string]: unknown
}

interface UseAuthOptions {
    middleware?: 'auth' | 'guest'
    redirectIfAuthenticated?: string
}

interface RegisterArgs {
    setErrors: (errors: Record<string, string[]>) => void
    [key: string]: unknown
}

interface LoginArgs {
    setErrors: (errors: Record<string, string[]>) => void
    setStatus: (status: string | null) => void
    [key: string]: unknown
}

interface ForgotPasswordArgs {
    setErrors: (errors: Record<string, string[]>) => void
    setStatus: (status: string | null) => void
    email: string
}

interface ResetPasswordArgs {
    setErrors: (errors: Record<string, string[]>) => void
    setStatus: (status: string | null) => void
    [key: string]: unknown
}

interface AuthHook {
    user: User | undefined
    error: Error | undefined
    register: (args: RegisterArgs) => Promise<void>
    login: (args: LoginArgs) => Promise<void>
    forgotPassword: (args: ForgotPasswordArgs) => Promise<void>
    resetPassword: (args: ResetPasswordArgs) => Promise<void>
    resendEmailVerification: (args: { setStatus: (status: string | null) => void }) => void
    logout: () => Promise<void>
}

/**
 * useAuth Hook
 * Standardized for Breeze-integrated Next.js projects.
 * handles CSRF and user state management via SWR.
 */
export const useAuth = ({ middleware, redirectIfAuthenticated }: UseAuthOptions = {}): AuthHook => {
    const router = useRouter()
    const params = useParams()

    const { data: user, error, mutate } = useSWR<User>('/api/user', () =>
        axios
            .get('/api/user')
            .then(res => res.data)
            .catch(error => {
                if (error.response?.status !== 409) throw error

                router.push('/verify-email')
            }),
    )

    const csrf = () => axios.get('/sanctum/csrf-cookie')

    const register = async ({ setErrors, ...props }: RegisterArgs) => {
        await csrf()

        setErrors({})

        axios
            .post('/register', props)
            .then(() => mutate())
            .catch(error => {
                if (error.response?.status !== 422) throw error

                setErrors(error.response.data.errors)
            })
    }

    const login = async ({ setErrors, setStatus, ...props }: LoginArgs) => {
        await csrf()

        setErrors({})
        setStatus(null)

        axios
            .post('/login', props)
            .then(() => mutate())
            .catch(error => {
                if (error.response?.status !== 422) throw error

                setErrors(error.response.data.errors)
            })
    }

    const forgotPassword = async ({ setErrors, setStatus, email }: ForgotPasswordArgs) => {
        await csrf()

        setErrors({})
        setStatus(null)

        axios
            .post('/forgot-password', { email })
            .then(response => setStatus(response.data.status))
            .catch(error => {
                if (error.response?.status !== 422) throw error

                setErrors(error.response.data.errors)
            })
    }

    const resetPassword = async ({ setErrors, setStatus, ...props }: ResetPasswordArgs) => {
        await csrf()

        setErrors({})
        setStatus(null)

        axios
            .post('/reset-password', { token: params?.token, ...props })
            .then(response =>
                router.push('/login?reset=' + btoa(response.data.status)),
            )
            .catch(error => {
                if (error.response?.status !== 422) throw error

                setErrors(error.response.data.errors)
            })
    }

    const resendEmailVerification = ({ setStatus }: { setStatus: (status: string | null) => void }) => {
        axios
            .post('/email/verification-notification')
            .then(response => setStatus(response.data.status))
    }

    const logout = useCallback(async () => {
        if (!error) {
            await axios.post('/logout').then(() => mutate())
        }

        window.location.pathname = '/login'
    }, [error, mutate])

    useEffect(() => {
        if (middleware === 'guest' && redirectIfAuthenticated && user)
            router.push(redirectIfAuthenticated)
        if (
            window.location.pathname === '/verify-email' &&
            user?.email_verified_at &&
            redirectIfAuthenticated
        )
            router.push(redirectIfAuthenticated)
        if (middleware === 'auth' && error) {
            logout().catch(() => {})
        }
    }, [user, error, middleware, redirectIfAuthenticated, router, logout])

    return {
        user,
        error,
        register,
        login,
        forgotPassword,
        resetPassword,
        resendEmailVerification,
        logout,
    }
}
