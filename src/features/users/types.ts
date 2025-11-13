export interface UserProfileStats {
	totalReviews: number;
	publishedReviews: number;
	totalLikesReceived: number;
}

export interface UserPublicProfile {
	id: string;
	username: string;
	displayName: string;
	avatarUrl: string | null;
	bio: string | null;
	createdAt: string;
	stats: UserProfileStats;
}
