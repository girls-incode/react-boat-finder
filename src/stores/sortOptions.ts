const sortOptions: Array<any> = [
    {
        label: 'Price',
        options: [
            {
                label: 'Price ⬆',
                value: 'price-asc'
            },
            {
                label: 'Price ⬇',
                value: 'price-desc'
            }
        ]
    },
    {
        label: 'Published date',
        options: [
            {
                label: 'Published date ⬇',
                value: 'publishedAt-desc',
            },
            {
                label: 'Published date ⬆',
                value: 'publishedAt-asc',
            }
        ]
    }
];

export default sortOptions;