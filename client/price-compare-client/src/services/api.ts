import axios from "axios";

interface ScrapeSource {
  name: string;
  order: number;
}

interface SearchPayload {
  query: string;
  scrapeSources: ScrapeSource[];
}

interface ScrapeHistoryRequest {
  userId: string;
}

interface ScrapeHDataResult {
  scrapeRequestId: string;
}

const API_BASE = process.env.REACT_APP_USER_DETAILS_SERVICE_HOST;

export const sendSearchRequest = async (userId: string, query: string, sources: ScrapeSource[]): Promise<SearchPayload[]> => {
  console.log(`Sending search request for userId: ${userId}, query: ${query}, sources: ${sources.join(', ')}`);  
  
  if (userId == undefined || query.length == 0 || sources.length == 0) 
    throw new Error("missing params")
  
  sources.sort((a: ScrapeSource, b: ScrapeSource) => {
    return Number(a.order) - Number(b.order);
  }); 
  
  const payload: SearchPayload = {
      query: query,
      scrapeSources: sources,
  };
  const URI = `${process.env.REACT_APP_SCRAPER_SERVICE_HOST}${process.env.REACT_APP_SCRAPER_SERVICE_SEARCH_REQUEST_ENDPOINT || "/search-history"}`;

  if (!URI) 
    throw new Error("API base URL is not defined");
  

  console.log('payload' + JSON.stringify(payload));
  console.log('URI ' + URI)
  // return  [];
  const res = await axios.post(URI, payload, {
    headers: { "Content-Type": "application/json", "userId": userId },
  });
  // const res = await fetch(URI, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json", "userId": userId },
  //   body: JSON.stringify({ payload }),
  // });

  if (res.status !== 200) {
    throw new Error("Search request failed");
  }

  return res.data;
};

interface HistoricalDataValueItem  {
  scrapeDate: string,
  source: string,
  scrapeRequestId: string,
  query: string,
  userId: string
}

export const retrieveScrapeHistoryList = async (userId: string): Promise<any> => {
    const URI = `${process.env.REACT_APP_USER_DETAILS_SERVICE_HOST}${process.env.REACT_APP_USER_DETAILS_SERVICE_USERHISTORY_ENDPOINT || "/search-history"}`;
  console.log(`Retrieving scrape history for userId: ${userId}`);
    if (!URI) {
      throw new Error("URI base URL is not defined");
    }

    const res = await fetch(URI, {
      method: "GET",
      headers: { "Content-Type": "application/json", "userId": userId }, 
    });

    if (!res.ok) {
      throw new Error("Search request failed");
    }
  
    const body = await res.json();
    const grouped = body.reduce((acc: any, item: any) => {
          if (!acc[item.scrapeRequestId]) {
            acc[item.scrapeRequestId] = [];
          }
          acc[item.scrapeRequestId].push(item);
          return acc;
      }, {} as Record<string, any[]>);

      const output = Object.entries(grouped).map(([key, value]) => ({
          key,
          value: value as HistoricalDataValueItem[]
      }));

    return output;
};

export const retrieveScrapeResultsData = async (userId: string, scrapeRequestId: string): Promise<any> => {
    const payload: ScrapeHDataResult = {
        scrapeRequestId: scrapeRequestId,
    };
    
    const URI = `${process.env.REACT_APP_USER_DETAILS_SERVICE_HOST}${process.env.REACT_APP_USER_DETAILS_SERVICE_SCRAPE_DATA_ENDPOINT || "/search-history"}`;

    if (!URI) {
      throw new Error("URI base URL is not defined");
    }

    const res = await fetch(URI, {
      method: "POST",
      headers: { "Content-Type": "application/json", "userId": userId },
      body: JSON.stringify({ payload }),
    });

    // console.log('request body: ' + JSON.stringify({ payload }));
    if (!res.ok) {
      return [];
      // throw new Error("Scrape data result request failed");
    }

    return await res.json();
};

export const deleteScrapeRequest = async (userId: string, scrapeRequestId: string): Promise<any> => {
    const URI = `${process.env.REACT_APP_USER_DETAILS_SERVICE_HOST}${process.env.REACT_APP_USER_DETAILS_SERVICE_DELETE_SCRAPE_DATA_ENDPOINT}`;

    if (!URI) {
        throw new Error("URI base URL is not defined");
    }

    const response = await fetch(URI, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'userId': userId,
            'scrapeId': scrapeRequestId
        },
        body: JSON.stringify({ payload: { scrapeRequestId } })
    });
    
    if (!response.ok) {
      return false;
    }

    return true;
};

interface PriceTrackItem {
    source: string;
    name: string;
    scrapeEngine?: string;
    iteration: number;
    img: string;
    iterationType: string;
    iterationStart: string;
    href: string;
    enabled: string;
}

export const addItemPriceTrack = async (userId: string, priceTrackItem: PriceTrackItem): Promise<any> => {
    // const payload: ScrapeHDataResult = {
    //     scrapeRequestId: scrapeRequestId,
    // };

    const URI = `${process.env.REACT_APP_PRICE_TRACK_SERVICE_HOST}${process.env.REACT_APP_PRICE_TRACK_ADD_SCHEDULED_ITEM_ENDPOINT}`;

    if (!URI) {
      throw new Error("URI base URL is not defined");
    }
    console.log(JSON.stringify({ priceTrackItem }));

    const res = await fetch(URI, {
      method: "POST",
      headers: { "Content-Type": "application/json", "userId": userId },
      body: JSON.stringify({ priceTrackItem }),
    });

    // console.log('request body: ' + JSON.stringify({ payload }));
    // if (!res.ok) {
    //   return [];
    //   // throw new Error("Scrape data result request failed");
    // }

    return await res.json();
};