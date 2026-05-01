import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:dio/dio.dart';
import '../utils/constants.dart';
import '../models/user.dart';

class ApiService {
  static final ApiService _instance = ApiService._();
  factory ApiService() => _instance;
  ApiService._();

  late final Dio _dio;
  final _storage = const FlutterSecureStorage();

  void init() {
    _dio = Dio(BaseOptions(
      baseUrl: AppConstants.baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {'Content-Type': 'application/json'},
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: AppConstants.tokenKey);
        if (token != null) options.headers['Authorization'] = 'Bearer $token';
        handler.next(options);
      },
      onError: (error, handler) {
        if (error.response?.statusCode == 401) {
          _storage.delete(key: AppConstants.tokenKey);
        }
        handler.next(error);
      },
    ));
  }

  Future<void> saveToken(String token) async =>
      _storage.write(key: AppConstants.tokenKey, value: token);

  Future<String?> getToken() => _storage.read(key: AppConstants.tokenKey);

  Future<void> clearToken() => _storage.delete(key: AppConstants.tokenKey);

  // ─── Auth ───
  Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await _dio.post('/auth/login', data: {'email': email, 'password': password});
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> register(Map<String, dynamic> data) async {
    final res = await _dio.post('/auth/register', data: data);
    return res.data['data'] as Map<String, dynamic>;
  }

  // ─── Users ───
  Future<User> getMe(String userId) async {
    final res = await _dio.get('/users/$userId');
    return User.fromJson(res.data['data'] as Map<String, dynamic>);
  }

  Future<User> updateProfile(String userId, Map<String, dynamic> data) async {
    final res = await _dio.put('/users/$userId', data: data);
    return User.fromJson(res.data['data'] as Map<String, dynamic>);
  }

  // ─── Membership ───
  Future<Membership?> getMyMembership(String userId) async {
    try {
      final res = await _dio.get('/membership/user/$userId');
      final data = res.data['data'];
      if (data == null) return null;
      return Membership.fromJson(data as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  Future<void> upgradeMembership(String userId, String type) async {
    await _dio.post('/membership/upgrade', data: {'user_id': userId, 'membership_type': type});
  }

  // ─── Courts ───
  Future<List<Court>> getCourts({String? city, String? clubId}) async {
    final res = await _dio.get('/users/courts', queryParameters: {
      if (city != null) 'city': city,
      if (clubId != null) 'club_id': clubId,
    });
    final items = (res.data['data']?['items'] ?? []) as List;
    return items.map((e) => Court.fromJson(e as Map<String, dynamic>)).toList();
  }

  // ─── Booking ───
  Future<Map<String, dynamic>> createBooking(Map<String, dynamic> data) async {
    final res = await _dio.post('/booking', data: data);
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<List<dynamic>> getMyBookings(String userId) async {
    final res = await _dio.get('/booking', queryParameters: {'user_id': userId});
    return (res.data['data']?['items'] ?? []) as List;
  }

  Future<void> cancelBooking(String bookingId) async {
    await _dio.post('/booking/$bookingId/cancel');
  }

  // ─── Matches ───
  Future<Map<String, dynamic>> createMatch(Map<String, dynamic> data) async {
    final res = await _dio.post('/matches', data: data);
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<void> recordMatchResult(String matchId, Map<String, dynamic> data) async {
    await _dio.post('/matches/$matchId/result', data: data);
  }

  Future<Map<String, dynamic>> getPlayerStats(String userId) async {
    final res = await _dio.get('/matches/player/$userId/stats');
    return res.data['data'] as Map<String, dynamic>? ?? {};
  }

  // ─── Ranking ───
  Future<List<RankEntry>> getLeaderboard({String? city, int limit = 50}) async {
    final res = await _dio.get('/ranking/leaderboard', queryParameters: {
      'limit': limit,
      if (city != null) 'city': city,
    });
    final items = (res.data['data'] ?? []) as List;
    return items.map((e) => RankEntry.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Map<String, dynamic>> getPlayerRating(String userId) async {
    final res = await _dio.get('/ranking/player/$userId/rating');
    return res.data['data'] as Map<String, dynamic>? ?? {};
  }

  // ─── Tournaments ───
  Future<List<Tournament>> getTournaments({String? status}) async {
    final res = await _dio.get('/tournaments', queryParameters: {
      'limit': 50,
      if (status != null) 'status': status,
    });
    final items = (res.data['data']?['items'] ?? []) as List;
    return items.map((e) => Tournament.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<void> registerTournament(String tournamentId, String userId) async {
    await _dio.post('/tournaments/$tournamentId/register', data: {'user_id': userId});
  }

  // ─── Notifications ───
  Future<List<dynamic>> getNotifications(String userId) async {
    final res = await _dio.get('/notifications/user/$userId', queryParameters: {'limit': 30});
    return (res.data['data']?['items'] ?? []) as List;
  }

  Future<int> getUnreadCount(String userId) async {
    final res = await _dio.get('/notifications/user/$userId/unread-count');
    return res.data['data']?['count'] as int? ?? 0;
  }
}
