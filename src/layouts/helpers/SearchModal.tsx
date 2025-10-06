import React, { useEffect, useState } from "react";
import SearchResult, { type ISearchItem } from "./SearchResult";

const SearchModal = () => {
  const [searchString, setSearchString] = useState("");
  const [searchData, setSearchData] = useState<ISearchItem[]>([]);

  // fetch search.json dynamically
  useEffect(() => {
    fetch("/json/search.json")
      .then((res) => res.json())
      .then((data: ISearchItem[]) => setSearchData(data))
      .catch(() => setSearchData([]));
  }, []);

  // handle input change
  const handleSearch = (e: React.FormEvent<HTMLInputElement>) => {
    setSearchString(e.currentTarget.value.replace("\\", "").toLowerCase());
  };

  // generate search result
  const doSearch = (data: ISearchItem[]) => {
    const regex = new RegExp(`${searchString}`, "gi");
    if (searchString === "") return [];
    return data.filter((item) => {
      const title = item.frontmatter.title.toLowerCase().match(regex);
      const description = item.frontmatter.description
        ?.toLowerCase()
        .match(regex);
      const categories = item.frontmatter.categories
        ?.join(" ")
        .toLowerCase()
        .match(regex);
      const tags = item.frontmatter.tags?.join(" ").toLowerCase().match(regex);
      const content = item.content.toLowerCase().match(regex);
      return title || content || description || categories || tags;
    });
  };

  const startTime = performance.now();
  const searchResult = doSearch(searchData);
  const endTime = performance.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(3);

  // search DOM manipulation
  useEffect(() => {
    const searchModal = document.getElementById("searchModal");
    const searchInput = document.getElementById("searchInput");
    const searchModalOverlay = document.getElementById("searchModalOverlay");
    const searchResultItems = document.querySelectorAll("#searchItem");
    const searchModalTriggers = document.querySelectorAll(
      "[data-search-trigger]"
    );

    // open modal
    searchModalTriggers.forEach((button) => {
      button.addEventListener("click", () => {
        searchModal!.classList.add("show");
        searchInput!.focus();
      });
    });

    // close modal
    searchModalOverlay!.addEventListener("click", () => {
      searchModal!.classList.remove("show");
    });

    // keyboard navigation
    let selectedIndex = -1;

    const updateSelection = () => {
      searchResultItems.forEach((item, index) => {
        if (index === selectedIndex) {
          item.classList.add("search-result-item-active");
        } else {
          item.classList.remove("search-result-item-active");
        }
      });
      searchResultItems[selectedIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    };

    const keyHandler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        searchModal!.classList.add("show");
        searchInput!.focus();
        updateSelection();
      }

      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
      }

      if (event.key === "Escape") searchModal!.classList.remove("show");

      if (event.key === "ArrowUp" && selectedIndex > 0) selectedIndex--;
      else if (
        event.key === "ArrowDown" &&
        selectedIndex < searchResultItems.length - 1
      )
        selectedIndex++;
      else if (event.key === "Enter") {
        const activeLink = document.querySelector(
          ".search-result-item-active a"
        ) as HTMLAnchorElement;
        if (activeLink) activeLink.click();
      }

      updateSelection();
    };

    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [searchString, searchData]);

  return (
    <div id="searchModal" className="search-modal">
      <div id="searchModalOverlay" className="search-modal-overlay" />
      <div className="search-wrapper">
        <div className="search-wrapper-header">
          <label htmlFor="searchInput" className="absolute left-7 top-[calc(50%-7px)]">
            <span className="sr-only">search icon</span>
            {searchString ? (
              <svg
                onClick={() => setSearchString("")}
                viewBox="0 0 512 512"
                height="18"
                width="18"
                className="hover:text-red-500 cursor-pointer -mt-0.5"
              >
                <title>close icon</title>
                <path
                  fill="currentcolor"
                  d="M256 512A256 256 0 10256 0a256 256 0 100 512zM175 175c9.4-9.4 24.6-9.4 33.9.0l47 47 47-47c9.4-9.4 24.6-9.4 33.9.0s9.4 24.6.0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6.0 33.9s-24.6 9.4-33.9.0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9.0s-9.4-24.6.0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6.0-33.9z"
                ></path>
              </svg>
            ) : (
              <svg viewBox="0 0 512 512" height="18" width="18" className="-mt-0.5">
                <title>search icon</title>
                <path
                  fill="currentcolor"
                  d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8.0 45.3s-32.8 12.5-45.3.0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9.0 208S93.1.0 208 0 416 93.1 416 208zM208 352a144 144 0 100-288 144 144 0 100 288z"
                ></path>
              </svg>
            )}
          </label>
          <input
            id="searchInput"
            placeholder="Search..."
            className="search-wrapper-header-input"
            type="input"
            name="search"
            value={searchString}
            onChange={handleSearch}
            autoComplete="off"
          />
        </div>
        <SearchResult searchResult={searchResult} searchString={searchString} />
        <div className="search-wrapper-footer">
          <span className="flex items-center">
            <kbd>Ctrl+K / Cmd+K</kbd> to open
          </span>
          {searchString && (
            <span>
              <strong>{searchResult.length} </strong> results - in{" "}
              <strong>{totalTime} </strong> seconds
            </span>
          )}
          <span>
            <kbd>ESC</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
