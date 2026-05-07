import BottomNav from '@/components/BottomNav'

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  )
}
