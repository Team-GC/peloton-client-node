import querystring = require("querystring");

import request from "./request";
import {
  FollowerFollowingResponse,
  MeResponse,
  RideDetailsResponse,
  RideResponse,
  UserResponse,
  WorkoutPerformanceGraphResponse,
  WorkoutResponse,
  WorkoutsResponse,
} from "./interfaces/responses";
import {
  AuthenticateOptions,
  FollowerFollowingOptions,
  RideDetailsOptions,
  RideFriendsOptions,
  RideOptions,
  WorkoutOptions,
  WorkoutPerformanceGraphOptions,
  WorkoutsOptions,
} from "./interfaces/options";

/**
 * The client variables which are stored to maintain a "session" when making requests.
 */
interface ClientVariables {
  loggedIn: boolean;
  cookie?: Array<string>;
  cookieString?: string;
  userId?: string;
  userAgent?: string;
}

const clientVariables: ClientVariables = {
  loggedIn: false,
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36",
};

/**
 * Returns the peloton API url for the given path
 * @param {string} forPath - the path to return the ULR for
 * @return {string} the full API url for the given path
 */
function _pelotonApiUrlFor(forPath: string): string {
  return `https://api.onepeloton.com/api${forPath}`;
}

/**
 * Returns the peloton auth URL for the given path
 * @param {string} forPath - the path to return the ULR for
 * @return {string} the full API url for the given path
 */
function _pelotonAuthUrlFor(forPath: string): string {
  return `https://api.onepeloton.com/auth${forPath}`;
}

/**
 * Verifies that the user is logged in by checking the clientVariables.loggedIn status.
 * @throws {Error} if the user is not logged in
 */
function _verifyIsLoggedIn() {
  if (!clientVariables.loggedIn) {
    throw new Error("Must authenticate before making API call.");
  }
}

/**
 * Verifies that the user is logged in by checking the clientVariables.loggedIn status.
 * @throws {Error} if the user is not logged in
 */
function setToken(token: string): void {
  clientVariables.loggedIn = true;
  clientVariables.cookieString = token;
}

/**
 * Verifies that the user is logged in by checking the clientVariables.loggedIn status.
 * @throws {Error} if the user is not logged in
 */
function getToken(): string {
  return clientVariables.cookieString;
}

/**
 * Authenticates the given user
 * @param {AuthenticationOptions} options - options used to authenticate
 */
async function validSession(): Promise<any> {
  _verifyIsLoggedIn();
  const sessionValid = await request.get(_pelotonAuthUrlFor("/check_session"), {
    cookie: clientVariables.cookieString,
    "User-Agent": clientVariables.userAgent,
  });

  return sessionValid;
}

/**
 * Authenticates the given user
 * @param {AuthenticationOptions} options - options used to authenticate
 */
async function authenticate(options: AuthenticateOptions): Promise<any> {
  const loginRes = await request.post(_pelotonAuthUrlFor("/login"), {
    username_or_email: options.username,
    password: options.password,
  });
  clientVariables.cookie = loginRes.headers["set-cookie"];
  clientVariables.userId = loginRes.data.user_id;
  clientVariables.loggedIn = true;

  clientVariables.cookieString = clientVariables.cookie[1];

  if (options.userAgent) {
    clientVariables.userAgent = options.userAgent;
  }

  return {
    cookies: clientVariables.cookie[1],
    ...loginRes,
  };
}

/**
 * Gets the current users information
 * @return {Promise<MeResponse>} the me call results
 */
async function me(): Promise<MeResponse> {
  _verifyIsLoggedIn();
  const meRes = await request.get(_pelotonApiUrlFor("/me"), {
    cookie: clientVariables.cookieString,
    "User-Agent": clientVariables.userAgent,
  });
  return meRes.data;
}

interface UserOptions {
  userId?: string;
}

/**
 * Get the details of a user specified by a given ID
 * @param {UserOptions} options - user options
 * @return {Promise<UserResponse | MeResponse>} the limited user information if a userId is
 * specified, or your full options if none specified or your own user ID specified
 */
async function user(
  options: UserOptions = {}
): Promise<UserResponse | MeResponse> {
  _verifyIsLoggedIn();
  const userId = options.userId || clientVariables.userId;
  const userRes = await request.get(_pelotonApiUrlFor(`/user/${userId}`), {
    cookie: clientVariables.cookieString,
    "User-Agent": clientVariables.userAgent,
  });
  return userRes.data;
}

/**
 * Returns a list of users who are followed by the specified userId (or authenticated userId if none
 * specified)
 * @param {FollowerFollowingOptions} options - the options to pass into the request
 * @return {Promise<FollowerFollowingResponse>} the list of those being followed by the specified
 * userId
 */
async function followers(
  options: FollowerFollowingOptions
): Promise<FollowerFollowingResponse> {
  _verifyIsLoggedIn();
  const userId = options.userId || clientVariables.userId;
  const limit = options.limit || 10;
  const page = options.page || 0;
  const workoutQueryParams = querystring.stringify({ limit, page });
  const followersRes = await request.get(
    _pelotonApiUrlFor(`/user/${userId}/followers?${workoutQueryParams}`),
    {
      cookie: clientVariables.cookieString,
      "User-Agent": clientVariables.userAgent,
    }
  );
  return followersRes.data;
}

/**
 * Returns a list of users following the specified userId (or authenticated userId if none
 * specified)
 * @param {FollowerFollowingOptions} options - the options to pass into the request
 * @return {Promise<FollowerFollowingResponse>} the list of those following the specified userId
 */
async function following(
  options: FollowerFollowingOptions
): Promise<FollowerFollowingResponse> {
  _verifyIsLoggedIn();
  const userId = options.userId || clientVariables.userId;
  const limit = options.limit || 10;
  const page = options.page || 0;
  const workoutQueryParams = querystring.stringify({ limit, page });
  const followingRes = await request.get(
    _pelotonApiUrlFor(`/user/${userId}/following?${workoutQueryParams}`),
    {
      cookie: clientVariables.cookieString,
      "User-Agent": clientVariables.userAgent,
    }
  );
  return followingRes.data;
}

/**
 * Fetch the workouts for the currently authenticated user, or a userId specified.
 * @param {WorkoutOptions} options - the options for fetching the workouts
 * @return {Promise<WorkoutsRes>} the workouts call results
 */
async function workouts(
  options: WorkoutsOptions = {}
): Promise<WorkoutsResponse> {
  _verifyIsLoggedIn();
  const userId = options.userId || clientVariables.userId;
  const joins = options.joins || "ride";
  const limit = options.limit || 10;
  const page = options.page || 0;

  const workoutQueryParams = querystring.stringify({ joins, limit, page });
  const workoutsRes = await request.get(
    _pelotonApiUrlFor(`/user/${userId}/workouts?${workoutQueryParams}`),
    {
      cookie: clientVariables.cookieString,
      "User-Agent": clientVariables.userAgent,
    }
  );
  return workoutsRes.data;
}

/**
 * Fetch information from a specific workout
 * @param {WorkoutOptions} options - request options
 * @return {Promise<WorkoutResponse>} the specified workout details
 */
async function workout(options: WorkoutOptions): Promise<WorkoutResponse> {
  _verifyIsLoggedIn();
  const workoutId = options.workoutId;
  const joins = options.joins || "user";

  const workoutQuery = querystring.stringify({ joins });

  const workoutRes = await request.get(
    _pelotonApiUrlFor(`/workout/${workoutId}?${workoutQuery}`),
    {
      cookie: clientVariables.cookieString,
      "User-Agent": clientVariables.userAgent,
    }
  );
  return workoutRes.data;
}

/**
 * Fetch performance graph information from a specific workout
 * @param {WorkoutPerformanceGraphOptions} options - request options
 * @return {Promise<WorkoutPerformanceGraphResponse>} the performance graph data
 */
async function workoutPerformanceGraph(
  options: WorkoutPerformanceGraphOptions
): Promise<WorkoutPerformanceGraphResponse> {
  _verifyIsLoggedIn();
  const { workoutId } = options;
  const every_n = options.everyN || 5;

  const queryString = querystring.stringify({ every_n });
  const workoutPerformanceGraphRes = await request.get(
    _pelotonApiUrlFor(`/workout/${workoutId}/performance_graph?${queryString}`),
    {
      cookie: clientVariables.cookieString,
      "User-Agent": clientVariables.userAgent,
    }
  );

  return workoutPerformanceGraphRes.data;
}

/**
 * Fetch information about a specific ride.
 * @param {RideOptions} options - request optoins
 * @return {Promise<RideResponse} information about the specified ride
 */
async function ride(options: RideOptions): Promise<RideResponse> {
  _verifyIsLoggedIn();
  const { rideId } = options;

  const rideRes = await request.get(_pelotonApiUrlFor(`/ride/${rideId}`), {
    cookie: clientVariables.cookieString,
    "User-Agent": clientVariables.userAgent,
  });
  return rideRes.data;
}

/**
 * Fetch information about friends who taken this ride
 * @param {RideOptions} options - request optoins
 * @return {Promise<RideResponse} information about the specified ride
 */
async function rideFriends(options: RideFriendsOptions): Promise<any> {
  _verifyIsLoggedIn();

  const rideId = options.rideId;
  const joins = options.joins || "user";
  const limit = options.limit || 10;
  const page = options.page || 0;

  const rideFriendsQuery = querystring.stringify({ joins, limit, page });

  const rideRes = await request.get(
    _pelotonApiUrlFor(
      `/ride/${rideId}/recent_following_workouts?${rideFriendsQuery}`
    ),
    {
      cookie: clientVariables.cookieString,
      "User-Agent": clientVariables.userAgent,
    }
  );
  return rideRes.data;
}

/**
 * Get the ride details of a specified ride id
 * @param {RideDetailsOptions} options - request options
 * @return {Promise<RideDetailsResponse>} the details of the specified ride
 */
async function rideDetails(
  options: RideDetailsOptions
): Promise<RideDetailsResponse> {
  _verifyIsLoggedIn();
  const { rideId } = options;

  const rideRes = await request.get(
    _pelotonApiUrlFor(`/ride/${rideId}/details`),
    {
      cookie: clientVariables.cookieString,
      "User-Agent": clientVariables.userAgent,
    }
  );
  return rideRes.data;
}

export const peloton = {
  validSession,
  setToken,
  getToken,
  rideFriends,
  authenticate,
  me,
  user,
  followers,
  following,
  workouts,
  workout,
  workoutPerformanceGraph,
  ride,
  rideDetails,
};
