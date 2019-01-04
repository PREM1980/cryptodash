import React from 'react';
import _ from 'lodash';

export const AppContext = React.createContext();
const cc = require('cryptocompare')
const MAX_FAVORITES = 10;

export class AppProvider extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            page: 'dashboard',
            ...this.savedSettings(),
            favorites: ['BTC','ETH','XMR','DOGE'],
            setPage: this.setPage,
            addCoin: this.addCoin,
            removeCoin: this.removeCoin,
            isInFavorites: this.isInFavorites,
            confirmFavorites: this.confirmFavorites,
            setFilteredCoins: this.setFilteredCoins
        }
    }

    componentDidMount = () => {
        this.fetchCoins();

        this.fetchPrices();
    }

    fetchCoins = async () => {
        let coinList = (await cc.coinList()).Data
        this.setState({coinList})
        console.log(coinList)
    }

    fetchPrices = async () => {
        if (this.state.firstVisit) return;
        let prices = await this.prices();
        this.setState({prices});
    }

    prices = async() =>{
        let returnData = [];
        for (let i=0; i < this.state.favorites.length; i++){
            try{
                let priceData = await cc.priceFull(this.state.favorites[i], 'USD')
                returnData.push(priceData)
            }
            catch (e){
                console.warn('Fetch price error:', e)
            }
        }
        return returnData;
    }

    addCoin = key =>{
        let favorites = [...this.state.favorites];
        if (favorites.length < MAX_FAVORITES){
            favorites.push(key)
            this.setState({favorites});
        }
    }
    
    removeCoin = key =>{
        let favorites = [...this.state.favorites];
        this.setState({favorites: _.pull(favorites, key)})
    }

    isInFavorites = key => _.includes(this.state.favorites, key)

    confirmFavorites = () => {

        this.setState({
            firstVisit: false,
            page: 'dashboard'
        }, ()=>{
            this.fetchPrices();
        })
        localStorage.setItem('cryptoDash', JSON.stringify({
            favorites: this.state.favorites
        }))
    }

    savedSettings(){
        let cryptoDashData = JSON.parse(localStorage.getItem('cryptoDash'));
        console.log('app provider = ', cryptoDashData)
        if (!cryptoDashData){
            return {page: 'settings', firstVisit: true}
        }
        let {favorites} = cryptoDashData;
        return {favorites};
        
    }
    
    setFilteredCoins = (filteredCoins) => this.setState({filteredCoins})

    setPage = page => this.setState({page})

    render(){
        return (
            <AppContext.Provider value={this.state}>
                {this.props.children}
            </AppContext.Provider>
        )
    }

}

console.log('app provider')