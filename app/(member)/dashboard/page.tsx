import { redirect } from 'next/navigation'

// Home is now the Reports landing.
export default function DashboardPage() {
  redirect('/reports')
}
