import React, { memo, useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

interface PriceTrackDataPoint {
    id: string;
    endScrapeDt: string;
    startScrapeDt: string;
    productName: string;
    productPrice: number;
    scrapeCode: string;
    scrapeDate: string;
    source: string;
    userId: string;
}

interface PriceTrackGraphProps {
    priceTrackDetails: PriceTrackDataPoint[];
}

interface ChartDataPoint {
    date: string;
    price: number;
    formattedDate: string;
    productName: string;
    originalIndex: number;
    originalId: string; // Original ID from data
    id: string; // Add unique identifier
    timestamp: number; // Add timestamp for uniqueness
}

export const PriceTrackGraph: React.FC<PriceTrackGraphProps> = memo(({ priceTrackDetails }) => {
    // Transform data for the chart
    const chartData: ChartDataPoint[] = useMemo(() => {
        if (!priceTrackDetails || priceTrackDetails.length === 0) {
            return [];
        }

        // First sort the original data by date
        const sortedOriginalData = [...priceTrackDetails].sort((a, b) => 
            new Date(a.scrapeDate).getTime() - new Date(b.scrapeDate).getTime()
        );

        const transformedData = sortedOriginalData.map((item, sortedIndex) => {
            const date = new Date(item.scrapeDate);
            const dataPoint = {
                date: item.scrapeDate,
                price: Number(item.productPrice), // Ensure it's a number
                formattedDate: date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: '2-digit'
                }),
                productName: item.productName,
                originalIndex: sortedIndex, // Use the sorted index
                originalId: item.id,
                id: `point-${sortedIndex}-${item.id}`, // More explicit ID
                // Add timestamp to force uniqueness
                timestamp: new Date(item.scrapeDate).getTime()
            };
            return dataPoint;
        });
        
        return transformedData;
    }, [priceTrackDetails]);

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length > 0) {
            // Try multiple ways to get the correct data
            const payloadData = payload[0].payload;
            const payloadValue = payload[0].value;
            
            // Find the data point by matching the label (formattedDate)
            const matchingDataPoint = chartData.find(point => point.formattedDate === label);
            
            // console.log('Payload data:', payloadData);
            // console.log('Payload value:', payloadValue);
            // console.log('Matching data point by label:', matchingDataPoint);
            // console.log('Label:', label);
            
            // Use the matching data point if found, otherwise fall back to payload
            const dataToUse = matchingDataPoint || payloadData;
            const priceToUse = matchingDataPoint ? matchingDataPoint.price : (payloadValue || payloadData.price);
            
            const date = new Date(dataToUse.date);
            const formattedDate = date.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="text-sm text-gray-600 mb-1">{formattedDate}</p>
                    <p className="text-lg font-semibold text-green-600">
                        ${Number(priceToUse).toFixed(2)}
                    </p>
                    <p className="text-xs text-blue-500">Index: {dataToUse.originalIndex}</p>
                    <p className="text-xs text-purple-500">Chart ID: {dataToUse.id}</p>
                    <p className="text-xs text-indigo-500">Original ID: {dataToUse.originalId}</p>
                    <p className="text-xs text-red-500">Used Price: {priceToUse}</p>
                    <p className="text-xs text-orange-500">Payload Value: {payloadValue}</p>
                    <p className="text-xs text-green-500">Matched by Label: {matchingDataPoint ? 'Yes' : 'No'}</p>
                    <p className="text-sm text-gray-500 truncate max-w-xs">{dataToUse.productName}</p>
                </div>
            );
        }
        return null;
    };

    // Format price for Y-axis
    const formatPrice = (value: number) => `$${value.toFixed(2)}`;

    if (!chartData.length) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No price data available</p>
            </div>
        );
    }

    return (
        <div className="w-full h-96 p-4 bg-white rounded-lg shadow-sm">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Price Tracking History</h3>
                <p className="text-sm text-gray-600">
                    Showing {chartData.length} price points over time
                </p>
            </div>
            
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    key={`chart-${chartData.map(d => d.id).join('-')}`}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 20,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="formattedDate"
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        type="category"
                        allowDuplicatedCategory={false}
                    />
                    <YAxis
                        tickFormatter={formatPrice}
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={['dataMin - 1', 'dataMax + 1']}
                        type="number"
                    />
                    <Tooltip 
                        content={<CustomTooltip />}
                        cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '5 5' }}
                        allowEscapeViewBox={{ x: false, y: false }}
                        animationDuration={0}
                        isAnimationActive={false}
                        wrapperStyle={{ outline: 'none' }}
                        position={{ x: undefined, y: undefined }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{
                            fill: '#10b981',
                            strokeWidth: 2,
                            r: 6
                        }}
                        activeDot={{
                            r: 8,
                            stroke: '#10b981',
                            strokeWidth: 2,
                            fill: '#ffffff'
                        }}
                        name="Price"
                        connectNulls={false}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
});
