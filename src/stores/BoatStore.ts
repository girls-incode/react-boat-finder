import { types, flow, Instance } from "mobx-state-tree";

interface Price {
    [key: string]: number;
}
interface Ranges {
    [key: string]: any;
}

const Manufacturer = types.model({
    id: types.string,
    name: types.string
});
export type IManufacturer = Instance<typeof Manufacturer>;

const BoatModel = types.model({
    name: types.string,
    id: types.string,
    manufacturer: Manufacturer
});

const Manufacturers = types.model({
    loading: types.boolean,
    data: types.array(Manufacturer)
}).actions(self => {
    const fetchProjects = flow(function* fetchProjects(url) {
        self.loading = true;
        try {
            let res = yield fetch(url);
            let data = yield res.json();
            self.data = data;
            self.loading = false;
        } catch (error) {
            console.error("Failed to fetch projects", error);
            self.loading = false;
        }
    });
    return {
        fetchProjects,
        afterCreate() {
            fetchProjects(process.env.REACT_APP_API_MANUFACTURERS)
        }
    }
});
export type IBoatModel = Instance<typeof BoatModel>;

export const Boat = types.model("Boat", {
    id: types.string,
    status: types.string,
    price: types.frozen<Price>(),
    model: BoatModel,
    manufactureYear: types.number,
    locationName: types.string,
    publishedAt: types.string,
    // images: types.array(types.string)
    images: types.array(types.frozen<any>())
});
export type IBoat = Instance<typeof Boat>;

const Boats = types
    .model("Boats", {
        loading: types.boolean,
        items: types.array(Boat),
        ranges: types.frozen<Ranges>(),
        currency: types.string,
        // state: types.enumeration("State", ["pending", "done", "error"])
    })
    .views(self => ({
    }))
    .actions(self => {
        const fetchProjects = flow(function* fetchProjects(url: any) {
            self.loading = true;
            console.log('fetchProjects', url);
            try {
                let res = yield fetch(url);
                let data = yield res.json();
                self.items = data.items;
                self.loading = false;
                self.ranges = data.ranges;
            } catch (error) {
                console.error("Failed to fetch projects", error);
                self.loading = false;
            }
        });
        return {
            fetchProjects,
            afterCreate() {
                fetchProjects(process.env.REACT_APP_API_SEARCH)
            }
        }
    });

export const BoatStore = Boats.create({
    loading: false,
    items: [],
    ranges: {},
    currency: 'EUR'
    // state: []
} as any);

export const ManufacturerStore = Manufacturers.create({
    loading: false,
    data: []
});