# matador

![image](https://github.com/user-attachments/assets/d8193851-ef5f-413f-8080-818ad051cde8)


## Background 

According to the Department of Transportation, increased access to public transportation has ["potential traffic safety, air quality, active	 transportation, and accessibility benefits, thus improving associated personal health outcomes."](https://www.transportation.gov/mission/health/Expand-Public-Transportation-Systems-and-Offer-Incentives) Yet, there are few easy ways to plan trips that do not involve the use of a car. Other tools in this segment, such as Google Maps and the mobile app Transit, provide a way to check transit details once the user has decided a destination and arrival/departure times, but there is no easy option for discovering places of interest based on important factors to the user such as travel cost and travel time. Matador aims to address this issue by adding a place-of-interest discovery and recommendation feature.
- Category: Navigation
- Story: Users create an account, and add information about themselves to their profile (e.g. home location, hobbies/interests, preferred mode of transportation)
- Market: Matador is aimed at users ages 16-50 who do not have easy access to cars or prefer to use public transportation, and wish to discover new activities or locations in their area.
- Habit: For the average user, Matador would be used between 2 and 4 times a week, primarily to discover new places of interest.
- Scope: The scope of Matador is focused toward point-of-interest discovery using public transportation.


## Planning

[Matador Project Plan](https://docs.google.com/document/d/1rh0tmpbFz5xN6_DJ93i_jU2v3aXhQCFg4A2rkFShMJg/edit?usp=sharing)

### Technical Challenge 1: Recommendation System
[Technical Challenge 1 Planning Document](https://docs.google.com/document/d/1gFQYEx6zlaSwk1dTCnF7-gtclOGAmhfq1x14WZvjQx8/edit#heading=h.hjbput8i4pt1)

Currently, it is difficult to discover places of interest that are accessible by public transit using traditional sources like Google Maps that allow users to discover locations based on geographical distance (e.g. hovering around pins within your screen area). My recommendation system seeks to solve this problem by integrating transit fare and transit duration data with user preferences to recommend places of interest that will be easily accessible and enjoyable, regardless of if it is geographically 1/2 mile away or 5 miles away but reachable in 4 minutes.


### Technical Challenge 2: Transit Fare/Duration Contour Maps
[Technical Challenge 2 Planning Document](https://docs.google.com/document/d/1999jsEqzGxmJLWvsb0gfelFW7tqA2MuG9mWDIfS5Xwk/edit#heading=h.fjxdaw2py7x9)

My application intends to improve users’ experiences with discovering places of interest near public transportation. This technical challenge improves the discoverability of points-of-interest when the user is panning around the map, as opposed to the discoverability provided through recommendations (which is the first technical challenge). Users are able to toggle between an equal-time (isochrone) or equal-cost (isodapane) overlay. This overlay on the map will represent areas where the user can most likely be able to travel to that point while remaining certain cost or time constraints.


### Stretch Goals

[Stretch Goal Planning Document](https://docs.google.com/document/d/196W2taGPrz_UocbDkarn6ZfklINS19WNNgjkFcew4Os/edit)
#### Dynamic Weight Learning
The recommendation system relies on a combination of three metrics— interest score, preference score, and transit score— in order to rank a filtered list of potential places of interest (POIs). These metrics are combined according to a weighting system. I previously used weights of 40% transit, and 30% each of interest and preference, in order to reflect the fact that the users using this app are more likely to prioritize public transportation in their search results.
However, I have added a dynamic weight system that learns a specific user’s preferred weights in order to make this application more appealing to a wider variety of users.


#### Community Recommendation Boosting
Previously, the recommendation system worked entirely based on the current user’s preferences, without incorporating the actions of any other users’ into the ranking system. 
In order to make the recommendations more tightly tailored to user’s preferences, I implemented a system to boost the recommendations of places that were liked by certain users. In particular, I am using the quantity of "likes" on a location along with the similarity of the users who "liked" that place to the current user, in order to generate a boosting factor.

