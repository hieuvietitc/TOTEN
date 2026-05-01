import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user.dart';
import '../services/api_service.dart';

class AuthNotifier extends StateNotifier<AsyncValue<User?>> {
  AuthNotifier() : super(const AsyncValue.data(null));

  final _api = ApiService();

  Future<void> login(String email, String password) async {
    state = const AsyncValue.loading();
    try {
      final data = await _api.login(email, password);
      final token = data['token'] as String;
      final user = User.fromJson(data['user'] as Map<String, dynamic>);
      await _api.saveToken(token);
      state = AsyncValue.data(user);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> register(Map<String, dynamic> data) async {
    state = const AsyncValue.loading();
    try {
      final res = await _api.register(data);
      final token = res['token'] as String;
      final user = User.fromJson(res['user'] as Map<String, dynamic>);
      await _api.saveToken(token);
      state = AsyncValue.data(user);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> logout() async {
    await _api.clearToken();
    state = const AsyncValue.data(null);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AsyncValue<User?>>(
  (_) => AuthNotifier(),
);

final currentUserProvider = Provider<User?>((ref) {
  return ref.watch(authProvider).value;
});
