import { FollowerFollowingResponse, MeResponse, RideDetailsResponse, RideResponse, UserResponse, WorkoutPerformanceGraphResponse, WorkoutResponse, WorkoutsResponse } from "./interfaces/responses";
import { AuthenticateOptions, FollowerFollowingOptions, RideDetailsOptions, RideFriendsOptions, RideOptions, WorkoutOptions, WorkoutPerformanceGraphOptions, WorkoutsOptions } from "./interfaces/options";
declare function setToken(token: string): void;
declare function getToken(): string;
declare function validSession(): Promise<any>;
declare function authenticate(options: AuthenticateOptions): Promise<any>;
declare function me(): Promise<MeResponse>;
interface UserOptions {
    userId?: string;
}
declare function user(options?: UserOptions): Promise<UserResponse | MeResponse>;
declare function followers(options: FollowerFollowingOptions): Promise<FollowerFollowingResponse>;
declare function following(options: FollowerFollowingOptions): Promise<FollowerFollowingResponse>;
declare function workouts(options?: WorkoutsOptions): Promise<WorkoutsResponse>;
declare function workout(options: WorkoutOptions): Promise<WorkoutResponse>;
declare function workoutPerformanceGraph(options: WorkoutPerformanceGraphOptions): Promise<WorkoutPerformanceGraphResponse>;
declare function ride(options: RideOptions): Promise<RideResponse>;
declare function rideFriends(options: RideFriendsOptions): Promise<any>;
declare function rideDetails(options: RideDetailsOptions): Promise<RideDetailsResponse>;
export declare const peloton: {
    validSession: typeof validSession;
    setToken: typeof setToken;
    getToken: typeof getToken;
    rideFriends: typeof rideFriends;
    authenticate: typeof authenticate;
    me: typeof me;
    user: typeof user;
    followers: typeof followers;
    following: typeof following;
    workouts: typeof workouts;
    workout: typeof workout;
    workoutPerformanceGraph: typeof workoutPerformanceGraph;
    ride: typeof ride;
    rideDetails: typeof rideDetails;
};
export {};
