import React from 'react';
import Page from '../Shared/Page';
import PriceGrid from "./PriceGrid"
import CoinSpotlight from "./CoinSpotlight"

export default function(){    
    return <Page name="dashboard">                        
            <PriceGrid/>    
            {/* <CoinSpotlight></CoinSpotlight> */}
            </Page>
}