 // Function to generate series data based on the fetched data
 function generateSeriesData(orders) {
    const normalData = [];
    const mediumData = [];
    const highData = [];

    orders.forEach(order => {
        const orderDate = new Date(order.orderDateTime).getTime();
        const urgencyLevel = order.urgencyLevel;

        if (urgencyLevel === 1) {
            normalData.push([orderDate, 1]);
        } else if (urgencyLevel === 2) {
            mediumData.push([orderDate, 1]);
        } else if (urgencyLevel === 3) {
            highData.push([orderDate, 1]);
        }
    });

    // Aggregate counts per day
    const aggregateData = (data) => {
        const aggregated = {};
        data.forEach(([date, count]) => {
            const dateStr = new Date(date).toISOString().split('T')[0];
            if (!aggregated[dateStr]) aggregated[dateStr] = 0;
            aggregated[dateStr] += count;
        });
        return Object.entries(aggregated).map(([date, count]) => [new Date(date).getTime(), count]);
    };

    return {
        normalData: aggregateData(normalData),
        mediumData: aggregateData(mediumData),
        highData: aggregateData(highData)
    };
}

// Fetch data from the API and update charts
const fetchOrders = async () => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            throw new Error('No access token found');
        }

        const response = await fetch('https://beep-zlaa.onrender.com/api/orders', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.status === 401) {
            console.log('Access token expired or invalid, refreshing...');
            await refreshAccessToken();
            return fetchOrders();
        }

        const data = await response.json();
        if (!data.orders || !Array.isArray(data.orders)) {
            throw new Error('Invalid data format');
        }

        // Extract and process the data
        const { normalData, mediumData, highData } = generateSeriesData(data.orders);

        console.log('Normal Data:', normalData); // Debugging line
        console.log('Medium Data:', mediumData); // Debugging line
        console.log('High Data:', highData); // Debugging line

        // Update chart1 (Bar Chart)
        chart1.updateOptions({
            series: [
                {
                    name: 'Normal',
                    data: normalData
                },
                {
                    name: 'Medium',
                    data: mediumData
                },
                {
                    name: 'High',
                    data: highData
                }
            ]
        });

        // Update chart2 (Area Chart)
        chart2.updateOptions({
            series: [
                {
                    name: 'Normal',
                    data: normalData
                },
                {
                    name: 'Medium',
                    data: mediumData
                },
                {
                    name: 'High',
                    data: highData
                }
            ]
        });

        // Update the HTML element with the order count
        const orderCount = data.orders.length;
        const ordersElement = document.getElementById('orderscount');
        if (ordersElement) {
            ordersElement.textContent = `${orderCount.toLocaleString()}`;
        } else {
            console.error('Element with ID "orderscount" not found');
        }

    } catch (error) {
        console.error('Error fetching orders:', error);
    }
};
function getFirstDayOfNextMonth() {
    const now = new Date();
    const nextMonth = now.getMonth() + 1; // Next month
    const year = now.getFullYear();
    
    return new Date(year, nextMonth, 1);
}

// Function to get the last day of the next month
function getLastDayOfNextMonth() {
    const firstDayOfNextMonth = getFirstDayOfNextMonth();
    return new Date(firstDayOfNextMonth.getFullYear(), firstDayOfNextMonth.getMonth() + 1, 0, 23, 59, 59);
}


// Initialize charts
const options1 = {
    chart: {
        id: "chart2",
        type: "area",
        height: 230,
        foreColor: "#ccc",
        toolbar: {
            autoSelected: "pan",
            show: false
        }
    },
    colors: ["#05FF00", "#FF7A00", "#FF0000"],
    stroke: {
        width: 3
    },
    grid: {
        borderColor: "#555",
        clipMarkers: false,
        yaxis: {
            lines: {
                show: false
            }
        }
    },
    dataLabels: {
        enabled: false
    },
    fill: {
        gradient: {
            enabled: true,
            opacityFrom: 0.55,
            opacityTo: 0
        }
    },
    markers: {
        size: 5,
        colors: ["#000524"],
        strokeColor: "#05FF00",
        strokeWidth: 3,
        fontFamilly:'Quicksand'

    },
    series: [
        {
            name: 'Normal',
            data: [] // Initially empty, will be updated
        },
        {
            name: 'Medium',
            data: [] // Initially empty, will be updated
        },
        {
            name: 'High',
            data: [] // Initially empty, will be updated
        }
    ],
    tooltip: {
        theme: "light",
        fontFamilly:'Quicksand'
    },
    xaxis: {
        type: "datetime",
        fontFamilly:'Quicksand'

    },
    yaxis: {
        min: 0,
        tickAmount: 4
    }
};

const options2 = {
    chart: {
        id: "chart1",
        height: 130,
        type: "bar",
        foreColor: "#ccc",
        brush: {
            target: "chart2",
            enabled: true
        },
        selection: {
            enabled: true,
            fill: {
                color: "#fff",
                opacity: 0.4
            },
            xaxis: {
                min: new Date("27 Jul 2024 10:00:00").getTime(),
                max: getLastDayOfNextMonth().getTime()
            }
        }
    },
    colors: ["#05FF00", "#FF7A00", "#FF0000"],
    series: [
        {
            name: 'Normal',
            data: [] // Initially empty, will be updated
        },
        {
            name: 'Medium',
            data: [] // Initially empty, will be updated
        },
        {
            name: 'High',
            data: [] // Initially empty, will be updated
        }
    ],
    stroke: {
        width: 2
    },
    grid: {
        borderColor: "#444"
    },
    markers: {
        size: 0
    },
    xaxis: {
        type: "datetime",
        tooltip: {
            enabled: false
        }
    },
    yaxis: {
        tickAmount: 2
    }
};

// Render charts
const chart1 = new ApexCharts(document.querySelector("#chart-area"), options1);
chart1.render();

const chart2 = new ApexCharts(document.querySelector("#chart-bar"), options2);
chart2.render();

// Fetch data and update charts
fetchOrders();
// Function to toggle fullscreen mode
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
            .then(() => localStorage.setItem('fullscreen', 'true'))
            .catch(err => console.error("Error attempting to enable fullscreen mode:", err));
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen()
                .then(() => localStorage.removeItem('fullscreen'))
                .catch(err => console.error("Error attempting to exit fullscreen mode:", err));
        }
    }
}

// Event listener for the fullscreen icon
document.getElementById('fullscreen-icon').addEventListener('click', toggleFullscreen);

// Check if fullscreen mode should be enabled on page load
window.addEventListener('load', () => {
    if (localStorage.getItem('fullscreen') === 'true') {
        document.documentElement.requestFullscreen().catch(err => console.error("Error attempting to enable fullscreen mode:", err));
    }
});
