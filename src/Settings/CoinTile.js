import React from 'react';
import { AppContext } from '../App/AppProvider';
import { SelectableTile } from '../Shared/Tile';
import CoinHeaderGrid from './CoinHeaderGrid';
import CoinImage from './CoinImage';

export default function({coinKey}){
    
    return <AppContext.Consumer>
        {({coinList}) => {
            let coin = coinList[coinKey];
            const TileClass = SelectableTile;
            return <TileClass>
                <CoinHeaderGrid name={coin.CoinName} symbol={coin.Symbol}></CoinHeaderGrid>     
                <CoinImage coin={coin}></CoinImage>
            </TileClass>
        }}
    </AppContext.Consumer>
}