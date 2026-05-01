class User {
  final String id;
  final String email;
  final String username;
  final String fullName;
  final String? phone;
  final String? city;
  final String role;
  final bool isActive;
  final String createdAt;

  const User({
    required this.id,
    required this.email,
    required this.username,
    required this.fullName,
    this.phone,
    this.city,
    required this.role,
    required this.isActive,
    required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
    id: json['id'] as String,
    email: json['email'] as String,
    username: json['username'] as String,
    fullName: json['full_name'] as String,
    phone: json['phone'] as String?,
    city: json['city'] as String?,
    role: json['role'] as String? ?? 'PLAYER',
    isActive: json['is_active'] as bool? ?? true,
    createdAt: json['created_at'] as String,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'email': email,
    'username': username,
    'full_name': fullName,
    'phone': phone,
    'city': city,
    'role': role,
    'is_active': isActive,
    'created_at': createdAt,
  };
}

class Membership {
  final String id;
  final String userId;
  final String type;
  final String status;
  final String? expiresAt;

  const Membership({
    required this.id,
    required this.userId,
    required this.type,
    required this.status,
    this.expiresAt,
  });

  factory Membership.fromJson(Map<String, dynamic> json) => Membership(
    id: json['id'] as String,
    userId: json['user_id'] as String,
    type: json['type'] as String,
    status: json['status'] as String,
    expiresAt: json['expires_at'] as String?,
  );
}

class Court {
  final String id;
  final String clubId;
  final String name;
  final String surfaceType;
  final bool isIndoor;
  final double basePrice;
  final bool isAvailable;
  final String? clubName;
  final String? clubCity;

  const Court({
    required this.id,
    required this.clubId,
    required this.name,
    required this.surfaceType,
    required this.isIndoor,
    required this.basePrice,
    required this.isAvailable,
    this.clubName,
    this.clubCity,
  });

  factory Court.fromJson(Map<String, dynamic> json) => Court(
    id: json['id'] as String,
    clubId: json['club_id'] as String,
    name: json['name'] as String,
    surfaceType: json['surface_type'] as String? ?? 'HARD',
    isIndoor: json['is_indoor'] as bool? ?? false,
    basePrice: (json['base_price'] as num?)?.toDouble() ?? 100000,
    isAvailable: json['is_available'] as bool? ?? true,
    clubName: json['club_name'] as String?,
    clubCity: json['club_city'] as String?,
  );
}

class RankEntry {
  final int rank;
  final String userId;
  final String fullName;
  final String? city;
  final double rating;
  final double totalPoints;
  final int matchesPlayed;

  const RankEntry({
    required this.rank,
    required this.userId,
    required this.fullName,
    this.city,
    required this.rating,
    required this.totalPoints,
    required this.matchesPlayed,
  });

  factory RankEntry.fromJson(Map<String, dynamic> json) => RankEntry(
    rank: json['rank'] as int? ?? 0,
    userId: json['user_id'] as String,
    fullName: json['full_name'] as String,
    city: json['city'] as String?,
    rating: (json['rating'] as num?)?.toDouble() ?? 1.0,
    totalPoints: (json['total_points'] as num?)?.toDouble() ?? 0,
    matchesPlayed: json['matches_played'] as int? ?? 0,
  );

  String get tier {
    if (rating <= 2.5) return 'BEGINNER';
    if (rating <= 4.0) return 'AMATEUR';
    if (rating <= 6.0) return 'CLUB_PLAYER';
    if (rating <= 8.0) return 'ADVANCED';
    return 'ELITE';
  }
}

class Tournament {
  final String id;
  final String name;
  final String type;
  final String status;
  final String startDate;
  final String endDate;
  final int maxParticipants;
  final double prizePool;

  const Tournament({
    required this.id,
    required this.name,
    required this.type,
    required this.status,
    required this.startDate,
    required this.endDate,
    required this.maxParticipants,
    required this.prizePool,
  });

  factory Tournament.fromJson(Map<String, dynamic> json) => Tournament(
    id: json['id'] as String,
    name: json['name'] as String,
    type: json['type'] as String,
    status: json['status'] as String,
    startDate: json['start_date'] as String,
    endDate: json['end_date'] as String,
    maxParticipants: json['max_participants'] as int? ?? 0,
    prizePool: (json['prize_pool'] as num?)?.toDouble() ?? 0,
  );
}
