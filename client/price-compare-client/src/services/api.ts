

interface ScrapeSource {
  name: string;
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

export const sendSearchRequest = async (userId: string, query: string, sources: string[]): Promise<SearchPayload[]> => {
  console.log(`Sending search request for userId: ${userId}, query: ${query}, sources: ${sources.join(', ')}`);  
  
  if (userId == undefined || query.length == 0 || sources.length == 0) 
    throw new Error("missing params")
  
  const payload: SearchPayload = {
      query: query,
      scrapeSources: sources.map(source => ({ name: source })),
  };
  const URI = `${process.env.REACT_APP_SCRAPER_SERVICE_HOST}${process.env.REACT_APP_SCRAPER_SERVICE_SEARCH_REQUEST_ENDPOINT || "/search-history"}`;

  if (!URI) 
    throw new Error("API base URL is not defined");
  

  console.log('payload' + JSON.stringify(payload));
  console.log('URI ' + URI)
  // return [];
  const res = await fetch(URI, {
    method: "POST",
    headers: { "Content-Type": "application/json", "userId": userId },
    body: JSON.stringify({ payload }),
  });

  if (!res.ok) {
    throw new Error("Search request failed");
  }

  return await res.json();
};

export const retrieveScrapeHistoryList = async (userId: string): Promise<any> => {
    const URI = `${process.env.REACT_APP_USER_DETAILS_SERVICE_HOST}${process.env.REACT_APP_USER_DETAILS_SERVICE_USERHISTORY_ENDPOINT || "/search-history"}`;

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
  
    return await res.json();
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

    if (!res.ok) {
      throw new Error("Scrape data result request failed");
    }

    return await res.json();
};