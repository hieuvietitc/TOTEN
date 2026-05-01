import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'providers/auth_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/booking/booking_screen.dart';
import 'screens/match/match_screen.dart';
import 'screens/ranking/ranking_screen.dart';
import 'screens/tournament/tournament_screen.dart';
import 'screens/profile/profile_screen.dart';
import 'screens/notification/notification_screen.dart';
import 'screens/membership/membership_screen.dart';
import 'services/api_service.dart';
import 'utils/app_theme.dart';

void main() {
  ApiService().init();
  runApp(const ProviderScope(child: TotenApp()));
}

final _router = GoRouter(
  initialLocation: '/login',
  redirect: (context, state) {
    // auth check handled in screens
    return null;
  },
  routes: [
    GoRoute(path: '/login',         builder: (_, __) => const LoginScreen()),
    GoRoute(path: '/register',      builder: (_, __) => const RegisterScreen()),
    GoRoute(
      path: '/home',
      builder: (_, __) => const _ScaffoldWithNav(child: HomeScreen()),
    ),
    GoRoute(path: '/booking',       builder: (_, __) => const BookingScreen()),
    GoRoute(path: '/match',         builder: (_, __) => const MatchScreen()),
    GoRoute(path: '/ranking',       builder: (_, __) => const RankingScreen()),
    GoRoute(path: '/tournaments',   builder: (_, __) => const TournamentScreen()),
    GoRoute(path: '/profile',       builder: (_, __) => const ProfileScreen()),
    GoRoute(path: '/notifications', builder: (_, __) => const NotificationScreen()),
    GoRoute(path: '/membership',    builder: (_, __) => const MembershipScreen()),
  ],
);

class TotenApp extends StatelessWidget {
  const TotenApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'TOTEN',
      theme: AppTheme.light,
      routerConfig: _router,
      debugShowCheckedModeBanner: false,
    );
  }
}

class _ScaffoldWithNav extends ConsumerWidget {
  final Widget child;
  const _ScaffoldWithNav({required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final location = GoRouterState.of(context).matchedLocation;

    int currentIndex = switch (location) {
      '/home'         => 0,
      '/booking'      => 1,
      '/ranking'      => 2,
      '/tournaments'  => 3,
      '/profile'      => 4,
      _ => 0,
    };

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentIndex,
        onDestinationSelected: (i) {
          final routes = ['/home', '/booking', '/ranking', '/tournaments', '/profile'];
          context.go(routes[i]);
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Trang chủ'),
          NavigationDestination(icon: Icon(Icons.sports_tennis_outlined), selectedIcon: Icon(Icons.sports_tennis), label: 'Đặt sân'),
          NavigationDestination(icon: Icon(Icons.leaderboard_outlined), selectedIcon: Icon(Icons.leaderboard), label: 'Xếp hạng'),
          NavigationDestination(icon: Icon(Icons.emoji_events_outlined), selectedIcon: Icon(Icons.emoji_events), label: 'Giải đấu'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Hồ sơ'),
        ],
      ),
    );
  }
}
