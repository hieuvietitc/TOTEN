class AppConstants {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:80/api',
  );

  static const String appName = 'TOTEN';
  static const String tokenKey = 'auth_token';
  static const String userKey = 'auth_user';

  static const Map<String, double> membershipFees = {
    'FREE': 0,
    'BASIC': 400000,
    'RANKED': 1000000,
    'ELITE': 3000000,
  };

  static const Map<String, String> membershipLabels = {
    'FREE': 'Miễn phí',
    'BASIC': 'Cơ bản',
    'RANKED': 'Xếp hạng',
    'ELITE': 'Elite',
  };

  static const List<String> cities = [
    'Hồ Chí Minh',
    'Hà Nội',
    'Đà Nẵng',
    'Cần Thơ',
    'Hải Phòng',
    'Biên Hoà',
    'Vũng Tàu',
    'Nha Trang',
  ];
}
