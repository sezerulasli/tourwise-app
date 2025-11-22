import React from 'react'
import custSer from "../assets/home_page/customer_services.png";
import { Link } from 'react-router-dom';
import '../styles/home.css';
import { Highlighter } from './ui/highlighter';
import { ScrollVelocityContainer, ScrollVelocityRow } from './ui/scroll-based-velocity';

/* import { Carousel } from "flowbite-react";
 */

const PLACES_FIRST_ROW = [
  'İstanbul',
  'Paris',
  'London',
  'New York',
  'Tokyo',
  'Sydney',
  'Rome',
  'Barcelona',
  'Amsterdam',
  'Prag',
  'Tokyo',
  'Seul',
]

const PLACES_SECOND_ROW = [
  'Bangkok',
  'Bali',
  'Singapur',
  'Los Angeles',
  'Rio de Janeiro',
  'Cancun',
  'Buenos Aires',
  'Cape Town',
  'Marrakech',
  'Zanzibar',
  'Nairobi',
  'Auckland',
]
export default function FooterBanner() {
  return (
    <>
      <div className='flex justify-center items-center h-[200px] text-gray-300 dark:text-[rgb(50,56,61)]'>
        <ScrollVelocityContainer className="text-5xl font-bold md:text-6xl">
          <ScrollVelocityRow baseVelocity={1} direction={1}>
            {PLACES_FIRST_ROW.map((place, index) => (
              <div key={index} className="px-3 md:px-6  leading-normal">{place}</div>
            ))}
          </ScrollVelocityRow>
          <ScrollVelocityRow baseVelocity={1} direction={-1}>
            {PLACES_SECOND_ROW.map((place, index) => (
              <div key={index} className="px-3 md:px-6 leading-normal">{place}</div>
            ))}
          </ScrollVelocityRow>
        </ScrollVelocityContainer>
      </div>

      <div className="relative isolate overflow-hidden bg-gradient-to-t from-gray-300 via-gray-100 to-white dark:from-[rgb(50,56,61)] dark:via-[rgb(32,38,43)] dark:to-[rgb(22,26,29)] px-6 pb-6 pt-10 lg:px-8 shadow-sm">
        {/* Background image */}
        <div className="absolute bottom-0 -right-4 -z-10 transform-gpu overflow-hidden sm:bottom-0">
          <img src={custSer} alt="Background" className="h-60 sm:h-72 object-contain" />
        </div>

        {/* Content area */}
        <div className="h-[230px] flex flex-col items-start justify-center lg:items-center pr-[150px] sm:pr-[200px] md:pr-0 dark:text-white gap-2 sm:gap-4">
          <h2 className="text-3xl font-bold tracking-tight text-balance text-gray-900 dark:text-gray-50 sm:text-5xl">
            Contact With Us!
          </h2>
          <p className="max-w-md text-gray-600 dark:text-gray-400 lg:text-center reduce_when_too_small hidden_when_too_small">
            Contact us for your valuable suggestions during&nbsp;
            <Highlighter action="underline" color="#FF9800">
              <span className='font-semibold text-gray-700 dark:text-gray-300'>the development process.</span>
            </Highlighter>{" "}
            We are also happy to answer your questions.
          </p>
          <Link to='/contact'>
            <button className="px-4 py-1 sm:py-1.5 text-lg font-semibold text-white bg-gray-500 rounded-lg shadow-md hover:scale-105 transition-transform">
              Contact Us
            </button>
          </Link>
        </div>
      </div>



      {/*       <div className="relative isolate overflow-hidden bg-gradient-to-t from-sky-200 dark:from-gray-800 px-6 pb-6 pt-20 lg:px-8 shadow-sm">
        <div className="absolute bottom-0 right-0 -z-10 transform-gpu overflow-hidden sm:bottom-0">
          <img src={custSer} alt="Background" className="h-60 sm:h-72 object-contain" />
        </div>

        <div className="h-[230px] flex flex-col items-start justify-center lg:items-center pr-[150px] md:pr-[0px]">
          <span>fdbsbsbsgbsddgdbs dbsbdsbgsbbs</span>
          <span>fdbsbsbsgbsddg dbsdbsbdsbgsbbs</span>

        </div>
      </div>
 */}

      {/*       <div className=" flex flex-row gap-5 sm:flex-col relative isolate overflow-hidden bg-slate-300 mb-5 px-6 py-6 lg:px-8">
        <div className='absolute bottom-0 right-0 -z-10 transform-gpu overflow-hidden sm:-bottom-0'>
          <img src={custSer} alt="..." className='h-60 sm:h-72' />
        </div>
        <div className="h-[230px] flex flex-row gap-5 sm:flex-col">
          fdbsbsbsgbsddgdbsdbsbdsbgsbbs

        </div>
      </div>
 */}



      {/*
    <div className="mb-3 px-3 h-56 sm:h-64 xl:h-80 2xl:h-96">
    banner
    <Carousel>
    <img src="https://ucdn.tatilbudur.net/tur/ipsala-kavala/855x426/135993.jpg" alt="..." />
    <img src="https://ucdn.tatilbudur.net/tur/ipsala-kavala/855x426/135992.jpg" alt="..." />
    <img src="https://ucdn.tatilbudur.net/tur/ipsala-kavala/855x426/135991.jpg" alt="..." />
    
    </Carousel>
    </div>
    */}

    </>
  )
}
