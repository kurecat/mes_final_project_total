using System;
using System.Threading.Tasks;
using MesMachineSim.Services;

namespace MesMachineSim
{
  class Program
  {
    static async Task Main(string[] args)
    {
      // 의존성 주입 및 실행
      var apiService = new ApiService();
      var simulator = new MachineSimulator(apiService);

      // 로그인 성공할 때까지 반복
      while (!(await LoginConsole.AttemptLogin(apiService))) 
      {
        Console.WriteLine(" 다시 시도하려면 아무 키나 누르세요...");
        Console.ReadKey();
      }


      try
      {
        await simulator.RunAsync();
      } catch (Exception ex)
      {
        Console.WriteLine($"심각한 오류 발생: {ex.Message}");
      }
      
    }
  }
}
