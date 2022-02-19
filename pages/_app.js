import '../styles/globals.css'
import Link from 'next/Link'

function NavLink({ label, href }) {
  return <Link href={href}>
    <a className='mr-6 text-pink-500'>
      {label}
    </a>
  </Link>
}

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className='border-b p-6'>
        <p className='text-4xl font-bold'>Metaverse Marketplace</p>
        <div className='flex mt-4'>
          <NavLink href='/' label='Home' />
          <NavLink href='/create-item' label='Sell Digital Asset' />
          <NavLink href='/my-assets' label='My Digital Assets' />
          <NavLink href='/creator-dashboard' label='Creator Dashboard' />
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
