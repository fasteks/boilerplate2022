import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Head from './head'
// import wave from '../assets/images/wave.jpg'

const Dashboard = () => {
  const [counter, setCounterNew] = useState(0)

  return (
    <div>
      <Head title="Dashboard" />
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col justify-center bg-neutral-900 p-10 rounded-xl select-none">
          <div className="text-white">
            <p className="text-center font-semibold">This is Dashboard</p>
            <button type="button" onClick={() => setCounterNew(counter + 1)}>
              updateCounter = {counter}
            </button>
            <p>
              <Link to="/">Go To Main</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

Dashboard.propTypes = {}

export default Dashboard
