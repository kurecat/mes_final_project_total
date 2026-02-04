using System;
using System.Collections.Generic;

public class WorkerResDto
{
    public long WorkerId { get; set; }
    public long MemberId { get; set; }
    public string Code { get; set; }
    public string Name { get; set; }
    public string Dept { get; set; }
    public string Shift { get; set; }
    public string Status { get; set; }
    public DateTime JoinDate { get; set; }
    public List<string> Certifications { get; set; }
}