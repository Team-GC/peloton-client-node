export interface AuthenticateOptions {
    username: string;
    password: string;
    userAgent?: string;
}
export interface FollowerFollowingOptions {
    userId?: string;
    limit?: number;
    page?: number;
}
export interface RideOptions {
    rideId: string;
}
export interface RideFriendsOptions {
    rideId: string;
    limit?: number;
    page?: number;
    joins?: string;
}
export interface RideDetailsOptions {
    rideId: string;
}
export interface WorkoutOptions {
    workoutId: string;
    joins?: string;
}
export interface WorkoutPerformanceGraphOptions {
    workoutId: string;
    everyN?: number;
}
export interface WorkoutsOptions {
    userId?: string;
    limit?: number;
    to?: string;
    from?: string;
    stats_to?: string;
    stats_from?: string;
    page?: number;
    joins?: string;
}
