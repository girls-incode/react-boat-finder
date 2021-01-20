import React from 'react';
import Box from '@material-ui/core/Box';
import { BoatStore, ManufacturerStore } from '../stores/BoatStore';
import Boats from './Boats';

function Home() {
    return (
        <Box p={4}>
            <header className='header'>
                <h1><img src="/images/boat-finder.svg" width="70" height="30" alt="" />Boat Finder</h1>
            </header>
            {/* <SearchFilters/> */}
            <Boats boats={BoatStore} manufacturers={ManufacturerStore} />
        </Box>
    )
}

export default Home
