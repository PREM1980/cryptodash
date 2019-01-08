import React from 'react';
import _ from 'lodash';
import moment from 'moment';

export const AppContext = React.createContext();
const cc = require('cryptocompare')
// cc.setApiKey('5018b2000069bfc32bccd25865105b9b6890e60c852b1c2f1b62169a787b64b9')
const MAX_FAVORITES = 10;
const TIME_UNITS = 10;

export class AppProvider extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            page: 'dashboard',
            ...this.savedSettings(),
            favorites: ['BTC','ETH','XMR'],
            setPage: this.setPage,
            addCoin: this.addCoin,
            removeCoin: this.removeCoin,
            isInFavorites: this.isInFavorites,            
            confirmFavorites: this.confirmFavorites,
            setCurrentFavorite: this.setCurrentFavorite,
            setFilteredCoins: this.setFilteredCoins
        }
    }

    componentDidMount = () => {
        this.fetchCoins();
        this.fetchPrices();
        this.fetchHistorical();
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
        console.log('prices = ', prices);
    }

    fetchHistorical = async () => {
        if (this.state.firstVisit) return;
        let results = await this.historical()        
        let historical = [
            {name: this.state.currentFavorite,
            data: results.map((ticker, index) => [
             moment().subtract({months: TIME_UNITS - index}).valueOf(),
             ticker.USD
            ])
            }
        ]
        console.log('historical =', historical)
        this.setState({historical})
    }

    historical = () => {
        let promises = []
        for (let units = TIME_UNITS; units > 0; units--){
            promises.push(
                cc.priceHistorical(
                    this.state.currentFavorite,
                    ['USD'],
                    moment()
                    .subtract({months: units})
                    .toDate()
                )
            )
        }
        return Promise.all(promises);

    }

    prices = async() =>{
        let returnData = [];
        for (let i=0; i < this.state.favorites.length; i++){
            try{
                console.log("Get price data for  = > " + this.state.favorites[i])
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
        let currentFavorite = this.state.favorites[0];

        this.setState({
            firstVisit: false,
            page: 'dashboard',
            currentFavorite,
            prices: null,
            historical: null,
        }, ()=>{
            this.fetchPrices();
            this.fetchHistorical();
        })
        localStorage.setItem('cryptoDash', JSON.stringify({
            favorites: this.state.favorites,
            currentFavorite
        }))
    }

    setCurrentFavorite = (sym) => {
        this.setState({
            currentFavorite: sym,
            historical: null,
        }, this.fetchHistorical)
        localStorage.setItem('cryptoDash', JSON.stringify({
            ...JSON.parse(localStorage.getItem('cryptoDash')),
            currentFavorite: sym
        })
        )
    }
    savedSettings(){
        let cryptoDashData = JSON.parse(localStorage.getItem('cryptoDash'));
        console.log('app provider = ', cryptoDashData)
        if (!cryptoDashData){
            return {page: 'settings', firstVisit: true}
        }
        let {favorites, currentFavorite} = cryptoDashData;
        return {favorites, currentFavorite};
        
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