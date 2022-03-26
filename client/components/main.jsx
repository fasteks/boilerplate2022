import React from 'react'
import { Link, useParams } from 'react-router-dom'
import Head from './head'

const Main = () => {
  const { planetId } = useParams()
  return (
    <div>
      <Head title="Main" />
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col justify-center bg-neutral-900 p-10 rounded-xl select-none">
          <div className="text-white">
            <p className="text-center font-semibold">
              {(planetId ? `This is planet with id = ${planetId}` : null) || 'This is Main'}
            </p>
            <Link to="/dashboard">Go To Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

Main.propTypes = {}

export default React.memo(Main)
