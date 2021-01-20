import React, { useEffect, useState } from 'react';
import { observer } from "mobx-react";
import { useHistory } from "react-router-dom";
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { compose, spacing, palette, breakpoints } from "@material-ui/system";
import styled from "styled-components";
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Slider from '@material-ui/core/Slider';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { rangeSteps } from '../stores/rangeSteps';
import sortOptions from '../stores/sortOptions';
import { CurrencyCode } from '../utils/CurrencyCode';
import Loader from './Loader';
import './Boats.css';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridGap: theme.spacing(3),
        },
        formControl: {
            margin: theme.spacing(1),
            minWidth: 120,
        },
        paper: {
            padding: theme.spacing(2),
            marginBottom: theme.spacing(2),
        },
        listing: {
            position: 'relative',
        },
        listingSearch: {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(4)
        },
        filters: {
            [theme.breakpoints.down('sm')]: {
                direction: 'column',
            }
        }
    }),
);

const Title = styled.h2`
  ${breakpoints(compose(spacing, palette))}
`;

const animatedComponents = makeAnimated();

const scale = (value: number): number => {
    const priceIndex = rangeSteps.findIndex((price) => price.value >= value);
    const price = rangeSteps[priceIndex];
    if (price.value === value) {
        return price.scaledValue;
    }
    const itemIndex = rangeSteps[priceIndex - 1];
    const ratio =
        (price.scaledValue - itemIndex.scaledValue) /
        (price.value - itemIndex.value || 1);
    const diff = value - itemIndex.value;
    return parseInt((ratio * diff + itemIndex.scaledValue).toFixed(0));
}

const descale = (scaledValue: number): number => {
    const priceIndex = rangeSteps.findIndex(
        (price) => price.scaledValue >= scaledValue,
    );
    const price = rangeSteps[priceIndex];
    if (price.scaledValue === scaledValue) {
        return price.value;
    }
    if (priceIndex === 0) {
        return 0;
    }
    const itemIndex = rangeSteps[priceIndex - 1];
    const ratio = (price.scaledValue - itemIndex.scaledValue) / (price.value - itemIndex.value || 1);
    const diff = scaledValue - itemIndex.scaledValue;
    return diff / ratio + itemIndex.value;
}

interface SortOption {
    label: string;
    value: string;
}

function Boats({ boats, manufacturers }: any) {
    const [manufOptions, setManufOptions] = useState([]);
    const [defaultSortOption, setDefaultSortOption] = useState<SortOption>(sortOptions[1].options[0]);
    const [defaultManufOptions, setDefaultManufOptions] = useState([]);
    const url = process.env.REACT_APP_API_IMAGES;
    const history = useHistory();
    const classes = useStyles();
    let { currency } = boats;
    let { search } = window.location;
    let currencySign = CurrencyCode[currency];
    let sortRegex = new RegExp('sort=\\w+&order=\\w+', 'igm');
    let manufRegex = new RegExp('manufacturer=[a-zA-Z%\\d\\-]+', 'igm');
    let priceRegex = new RegExp('priceRange=\\d+\\-\\d+', 'igm');
    let dateFormat = { year: 'numeric', month: 'long', day: 'numeric', hour12: false };
    let comma = "%2C";
    let [rangePrice, setRangePrice] = useState<number[]>([
        rangeSteps[0].value,
        rangeSteps[rangeSteps.length - 1].value,
    ]);
    let nf = new Intl.NumberFormat();

    function updateUrlParams(regex: RegExp, newParams: string): void {
        if (search) {
            let arr = search.match(regex);
            if (arr?.length) {
                let newSearch = search.replace(arr[0], newParams);
                if (!newParams && newSearch[newSearch.length - 1] === "&") {
                    newSearch = newSearch.slice(0, -1);
                }
                newSearch = newSearch.replace("&&", "&").replace("?&", "?");
                console.log(newSearch);
                history.push(newSearch);
                boats.fetchProjects(process.env.REACT_APP_API_SEARCH + newSearch);
            } else {
                history.push(search + '&' + newParams);
                boats.fetchProjects(process.env.REACT_APP_API_SEARCH + search + '&' + newParams);
            }
        } else {
            history.push('?' + newParams);
            boats.fetchProjects(process.env.REACT_APP_API_SEARCH + '?' + newParams);
        }
    }

    function handleSelectChange(val: any, ev: any) {
        let { name } = ev;
        let newParams: string = '';

        if (name === "sort") {
            let [optionField, optionValue] = val.value.split("-");
            newParams = name + '=' + optionField + '&order=' + optionValue;
            updateUrlParams(sortRegex, newParams);
            updateSortOption(newParams);
        } else if (name === "manufacturer") {
            if (!val) {
                newParams = '';
            } else {
                let selected = val.reduce((str: string, item: any) => str + comma + item.value, '');
                newParams = name + '=' + selected.substr(3);
            }
            updateUrlParams(manufRegex, newParams);
        }
    }

    function handleSlider(event: any, newPrice: any) {
        let newParams: string = '';
        newParams = `priceRange=${scale(newPrice[0])}-${scale(newPrice[1])}`;
        setRangePrice(newPrice as number[]);
        updateUrlParams(priceRegex, newParams);
    }

    function numFormatter(num: number) {
        if (num > 999 && num < 1000000) {
            return (num / 1000).toFixed(0) + "K";
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + "M";
        }
        return num;
    }

    function updateSortOption(newParams?: string) {
        let sortParams;
        if (newParams) {
            sortParams = newParams.match(sortRegex);
        } else {
            sortParams = search.match(sortRegex);
        }
        let defaultOps: SortOption;
        console.log(sortParams);

        if (sortParams) {
            let sortData = sortParams[0].split("&");
            let sortKey = sortData[0].split("=")[1];
            let sortOrder = sortData[1].split("=")[1];
            let opsKey = sortKey + '-' + sortOrder;

            for (let { options } of sortOptions) {
                defaultOps = options.find(({ value }: any) => value === opsKey);
                if (defaultOps && Object.keys(defaultOps).length > 0) {
                    setDefaultSortOption(defaultOps);
                    break;
                };
            }
        }
    }

    useEffect(() => {
        updateSortOption();
    }, []);

    useEffect(() => {
        if (!boats.loading) {
            let priceParams = search.match(priceRegex);
            let startPrice, endPrice;

            if (priceParams) {
                let range = priceParams[0].split("=")[1].split("-");
                startPrice = descale(parseInt(range[0]));
                endPrice = descale(parseInt(range[1]));
                setRangePrice([startPrice, endPrice]);
            }
        }
    }, [boats.loading]);

    useEffect(() => {
        if (!manufacturers.loading) {
            let manufParams = search.match(manufRegex) || [];
            let items = manufParams.length ? manufParams[0].split("=")[1].split(comma) : [];
            let list: any = [];
            let defManuf: any = [];
            list = manufacturers.data.map((item: any) => {
                let opt = { value: item.id, label: item.name };
                if (items.length) {
                    if (items.includes(item.id)) {
                        defManuf.push(opt)
                    }
                }
                return opt;
            });
            setManufOptions(list);

            if (defManuf.length) {
                setDefaultManufOptions(defManuf);
            }

        }
    }, [manufacturers.loading]);

    return (
        <Grid container direction="column" className={classes.listing} >
            <Grid item xs={12} className={classes.listingSearch}>
                <Grid container direction="row" spacing={2} className={classes.filters}>
                    {manufOptions.length > 0 && (
                        <Grid item xs={12} sm={4}>
                            <Select
                                options={manufOptions}
                                name="manufacturer"
                                isMulti
                                defaultValue={defaultManufOptions}
                                components={animatedComponents}
                                onChange={handleSelectChange} />
                        </Grid>
                    )}
                    <Grid item xs={12} sm={4}>
                        <Select
                            value={defaultSortOption}
                            options={sortOptions}
                            name="sort"
                            onChange={handleSelectChange} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <>
                            <Slider
                                scale={scale}
                                min={0}
                                max={180}
                                valueLabelDisplay="auto"
                                value={rangePrice}
                                onChangeCommitted={handleSlider}
                                aria-labelledby="range-slider"
                                valueLabelFormat={numFormatter}
                            />
                            <div className="price-slider">
                                <div className="min-price">{currencySign} {nf.format(scale(rangePrice[0]))}</div>
                                <div className="max-price">{currencySign} {nf.format(scale(rangePrice[1]))}</div>
                            </div>
                        </>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12} className="list">
                {boats.loading && <Loader />}
                {!boats.loading && !boats.items.length && <h1 className="text-center">No items found...</h1>}
                {!boats.loading && (
                    boats.items.map((boat: any) => {
                        let { model } = boat;
                        return (
                            <Paper className={classes.paper} key={boat.id}>
                                <Grid container className="card">
                                    <Grid item xs={12} sm={4} className="card-gallery">
                                        {boat.images.map((img: string, i: number) => {
                                            return <img
                                                loading={i < 2 ? "eager" : "lazy"}
                                                key={i}
                                                src={url + img}
                                                height="180"
                                                width="300"
                                                alt="" />
                                        })}
                                    </Grid>
                                    <Grid item xs={12} sm={8} className="card-info">
                                        <Title mt={{ xs: 3, sm: 0 }} mb={3}>
                                            {model.manufacturer.name} {model.name}
                                        </Title>
                                        {boat.price[currency] > 0 && (
                                            <div><strong className="card-price">{currencySign} {nf.format(boat.price[currency])}</strong></div>
                                        )}
                                        <div>{boat.locationName}</div>
                                        <div>{new Date(boat.publishedAt).toLocaleString('en-US', dateFormat)}</div>
                                    </Grid>
                                </Grid>
                            </Paper>
                        )
                    })
                )}
            </Grid>
        </Grid >
    )
};

export default observer(Boats);
