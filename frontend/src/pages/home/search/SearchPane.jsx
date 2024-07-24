import PropTypes from "prop-types";
import { ScrollArea, Loader } from "@mantine/core";
import Search from "./Search";
import SearchResult from "./SearchResult";
import "./SearchPane.css";

export default function SearchPane({
  form,
  handleFormSubmit,
  options,
  isResultsLoading,
  noResultsFound,
  activeOption,
  setActiveOption,
  setIsRouteDetailDisplayed,
  likedPlaces,
  handleLikePlace,
}) {
  return (
    <>
      <Search form={form} handleFormSubmit={handleFormSubmit} />
      {isResultsLoading && (
        <div id="results-loading-wrapper">
          <Loader color="blue" size="xl" type="dots" />
        </div>
      )}
      <ScrollArea id="results-scrollarea">
        {options?.length > 0 &&
          options.map((option) => (
            <SearchResult
              key={option.place.id}
              option={option}
              activeOption={activeOption}
              setActiveOption={setActiveOption}
              setIsRouteDetailDisplayed={setIsRouteDetailDisplayed}
              liked={likedPlaces
                ?.map((place) => place.id)
                .includes(option.place.id)}
              handleLikePlace={handleLikePlace}
            />
          ))}
        {noResultsFound && (
          <p>No results found. Please try a different search.</p>
        )}
      </ScrollArea>
    </>
  );
}

SearchPane.propTypes = {
  form: PropTypes.object.isRequired,
  handleFormSubmit: PropTypes.func.isRequired,
  options: PropTypes.array,
  isResultsLoading: PropTypes.bool.isRequired,
  noResultsFound: PropTypes.bool.isRequired,
  activeOption: PropTypes.object,
  setActiveOption: PropTypes.func.isRequired,
  setIsRouteDetailDisplayed: PropTypes.func.isRequired,
  likedPlaces: PropTypes.array,
  handleLikePlace: PropTypes.func.isRequired,
};
