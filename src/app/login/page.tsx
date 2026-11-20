import LoginForm from '@/components/auth/login-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function LoginPage(_props: PageProps<'/login'>) {
  return (
    <main className="h-dvh flex flex-col justify-center items-center">
      <Card className="max-w-140 min-w-96">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Masukan email dan password yang benar untuk mulai menggunakan ke
            FacultyGrid
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  )
}
