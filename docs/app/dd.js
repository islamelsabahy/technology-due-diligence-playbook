/* Technology due diligence scorer: evidence-weighted risk per domain, red flags, remediation cost,
 * normalized run-rate, Day 1 / Day 100 plan and deal protections. Pure functions, no I/O. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.DD = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  // Answer codes: 4 yes with evidence, 3 yes but only claimed, 2 partial, 1 no, 0 unknown.
  var STRENGTH = [0, 0, 0.4, 0.7, 1], CONFIDENCE = [0, 1, 0.7, 0.4, 1];
  // check: [id, importance 1..3, critical, one-time EGP (small co.), recurring EGP/yr (small co.), timing d1|d100|later, ar, en]
  var DOMAINS = [
    { id: "infra", w: 0.10, ar: "البنية التحتية", en: "Infrastructure", c: [
      ["infra-support", 3, true, 400000, 60000, "d100", "الأنظمة الحرجة على أجهزة وبرامج لسه مدعومة من المصنع", "Critical systems run on vendor-supported hardware and software"],
      ["infra-backup", 3, true, 250000, 80000, "d1", "النسخ الاحتياطي موجود والاسترجاع اتجرّب خلال آخر 6 شهور", "Backups exist and a restore was tested in the last 6 months"],
      ["infra-dr", 2, false, 600000, 150000, "later", "فيه خطة تعافي من الكوارث بأهداف RTO/RPO", "A disaster recovery plan with RTO/RPO targets exists"]] },
    { id: "apps", w: 0.10, ar: "التطبيقات", en: "Applications", c: [
      ["apps-inventory", 2, false, 80000, 0, "d100", "فيه حصر كامل للتطبيقات ومالك لكل تطبيق", "A complete application inventory with an owner per app"],
      ["apps-source", 3, true, 300000, 0, "d1", "الشركة مالكة الكود المصدري أو فيه escrow للتطبيقات المخصصة", "The company owns the source code or has escrow for custom apps"],
      ["apps-debt", 2, false, 900000, 100000, "later", "الديون التقنية معروفة ومقدّرة التكلفة", "Technical debt is known and costed"]] },
    { id: "arch", w: 0.08, ar: "المعمارية والتكامل", en: "Architecture & integration", c: [
      ["arch-docs", 1, false, 100000, 0, "d100", "فيه رسم محدث للمعمارية وتدفق البيانات", "Up-to-date architecture and data-flow diagrams exist"],
      ["arch-api", 2, false, 500000, 60000, "later", "الأنظمة الأساسية متكاملة بـ APIs موثقة", "Core systems integrate through documented APIs"],
      ["arch-identity", 2, false, 250000, 50000, "d100", "تسجيل دخول موحد (SSO) ممكن يتدمج مع المشتري", "Single sign-on that can integrate with the acquirer"]] },
    { id: "sec", w: 0.16, ar: "الأمن السيبراني", en: "Cybersecurity", c: [
      ["sec-mfa", 3, true, 120000, 60000, "d1", "MFA مفعّل على كل الحسابات ذات الصلاحيات العالية", "MFA on every privileged account"],
      ["sec-vulns", 3, true, 200000, 120000, "d1", "مفيش ثغرات حرجة مفتوحة أكتر من 30 يوم", "No critical vulnerabilities open for more than 30 days"],
      ["sec-leaver", 2, true, 60000, 0, "d1", "حسابات الموظفين اللي سابوا بتتقفل في نفس اليوم", "Leavers' accounts are disabled the same day"],
      ["sec-incidents", 2, false, 150000, 0, "d100", "الحوادث السابقة اتقفلت بأدلة ودروس مستفادة", "Past incidents are closed with evidence and lessons learned"],
      ["sec-owner", 2, false, 0, 420000, "d100", "فيه مسؤول أمن معلومات واضح", "A named security owner exists"]] },
    { id: "cloud", w: 0.08, ar: "السحابة والاستضافة", en: "Cloud & hosting", c: [
      ["cloud-cost", 2, false, 60000, 0, "d100", "تكاليف السحابة متتبعة لكل نظام", "Cloud costs are tracked per system"],
      ["cloud-access", 2, true, 80000, 30000, "d1", "حسابات الـ root/admin في السحابة محمية وموثقة", "Cloud root/admin accounts are protected and documented"],
      ["cloud-contract", 1, false, 40000, 0, "later", "عقود الاستضافة قابلة للنقل للمشتري", "Hosting contracts are transferable to the acquirer"]] },
    { id: "data", w: 0.10, ar: "البيانات والتحليلات", en: "Data & analytics", c: [
      ["data-quality", 2, false, 350000, 60000, "later", "بيانات العملاء والمالية نظيفة ومطابقة بين الأنظمة", "Customer and finance data are clean and reconciled across systems"],
      ["data-privacy", 3, true, 200000, 50000, "d1", "مطابقة لقانون حماية البيانات الشخصية 151 لسنة 2020", "Compliant with Egypt's Personal Data Protection Law 151/2020"],
      ["data-access", 2, false, 100000, 0, "d100", "صلاحيات الوصول للبيانات الحساسة محددة ومراجَعة", "Access to sensitive data is defined and reviewed"]] },
    { id: "erp", w: 0.10, ar: "الـ ERP وأنظمة الأعمال", en: "ERP & business apps", c: [
      ["erp-live", 3, false, 1500000, 250000, "later", "الـ ERP شغال ومستخدم فعلًا في المالية والمشتريات", "The ERP is live and actually used for finance and procurement"],
      ["erp-custom", 2, false, 400000, 80000, "later", "التخصيصات على الـ ERP محدودة وموثقة", "ERP customisations are limited and documented"],
      ["erp-eta", 2, true, 150000, 30000, "d1", "الفاتورة الإلكترونية والإيصال الإلكتروني متكاملين", "ETA e-invoice and e-receipt are integrated"]] },
    { id: "ai", w: 0.06, ar: "الـ AI والأتمتة", en: "AI & automation", c: [
      ["ai-inventory", 1, false, 40000, 0, "d100", "فيه حصر لأدوات الـ AI المستخدمة والبيانات اللي بتتبعت لها", "AI tools in use and the data sent to them are inventoried"],
      ["ai-policy", 2, false, 30000, 0, "d100", "فيه سياسة استخدام AI معتمدة", "An approved AI acceptable-use policy exists"],
      ["ai-claims", 2, false, 0, 0, "d1", "ادعاءات الـ AI في عرض البيع مثبتة بأرقام", "AI claims in the sale pitch are backed by numbers"]] },
    { id: "vendors", w: 0.10, ar: "الموردين والتراخيص", en: "Vendors & licences", c: [
      ["ven-licence", 3, true, 600000, 200000, "d1", "التراخيص مطابقة (مفيش نسخ غير مرخصة أو استخدام زيادة)", "Licences are compliant (no unlicensed copies or over-use)"],
      ["ven-change", 2, false, 150000, 0, "d100", "عقود الموردين المهمة مفيهاش بند إنهاء عند تغيير الملكية", "Key vendor contracts have no termination on change of control"],
      ["ven-concentration", 1, false, 0, 0, "later", "مفيش اعتماد كامل على مورد واحد صغير", "No total dependence on a single small vendor"]] },
    { id: "org", w: 0.12, ar: "فريق التقنية", en: "Technology team", c: [
      ["org-keyperson", 3, true, 250000, 300000, "d1", "مفيش شخص واحد بس عنده كل كلمات السر والمعرفة", "No single person holds all passwords and knowledge"],
      ["org-docs", 2, false, 120000, 0, "d100", "الإجراءات التشغيلية موثقة", "Operating procedures are documented"],
      ["org-retention", 2, false, 0, 250000, "d1", "الموظفين الأساسيين عليهم خطة احتفاظ", "Key staff are covered by a retention plan"]] }
  ];
  var SIZES = { small: 1, medium: 2.5, large: 6 };
  var GRADES = [[20, "A"], [35, "B"], [50, "C"], [65, "D"], [101, "E"]];

  function checks() { var out = []; DOMAINS.forEach(function (d) { d.c.forEach(function (c) { out.push({ domain: d.id, id: c[0], imp: c[1], critical: c[2], once: c[3], rec: c[4], timing: c[5], ar: c[6], en: c[7] }); }); }); return out; }
  var CHECKS = checks();

  function assess(answers, opts) {
    opts = opts || {}; var k = SIZES[opts.size || "medium"] || 1, run = Number(opts.run_rate || 0), revenue = Number(opts.revenue || 0);
    var dom = {}, total = 0, confNum = 0, confDen = 0, flags = [], once = 0, rec = 0, plan = { d1: [], d100: [], later: [] };
    DOMAINS.forEach(function (d) {
      var num = 0, den = 0, cn = 0, cd = 0;
      d.c.forEach(function (c) {
        var a = answers[c[0]]; a = a === undefined ? 0 : Number(a);
        if (!(a >= 0 && a <= 4) || a !== Math.floor(a)) throw new Error("answer for " + c[0] + " must be 0..4");
        var s = STRENGTH[a], gap = 1 - s;
        num += c[1] * gap; den += c[1]; cn += c[1] * CONFIDENCE[a]; cd += c[1];
        if (gap > 0) {
          var o = c[3] * gap * k, r = c[4] * gap * k; once += o; rec += r;
          plan[c[5]].push({ id: c[0], domain: d.id, once: o, rec: r });
          if (c[2] && s < 0.7) flags.push({ id: c[0], domain: d.id, severity: a <= 1 ? "Critical" : "High", validate: a === 0 || a === 3 });
          else if (c[2] && a === 3) flags.push({ id: c[0], domain: d.id, severity: "Medium", validate: true });
        }
      });
      dom[d.id] = { risk: 100 * num / den, confidence: 100 * cn / cd };
      total += d.w * dom[d.id].risk; confNum += d.w * dom[d.id].confidence; confDen += d.w;
    });
    var conf = confNum / confDen, grade = GRADES.filter(function (g) { return total < g[0]; })[0][1];
    var crit = flags.filter(function (f) { return f.severity === "Critical"; }).length;
    var protections = [];
    if (crit) protections.push("cp");
    if (once + 2 * rec > 0) protections.push("price");
    if (conf < 60) protections.push("escrow");
    if (flags.some(function (f) { return f.id === "org-keyperson" || f.id === "org-retention"; })) protections.push("retention");
    if (flags.some(function (f) { return f.id === "ven-licence"; })) protections.push("indemnity");
    var order = { Critical: 0, High: 1, Medium: 2 };
    flags.sort(function (a, b) { return order[a.severity] - order[b.severity] || (a.id < b.id ? -1 : 1); });
    ["d1", "d100", "later"].forEach(function (p) { plan[p].sort(function (a, b) { return (b.once + b.rec) - (a.once + a.rec) || (a.id < b.id ? -1 : 1); }); });
    return { risk: total, grade: grade, confidence: conf, domains: dom, flags: flags, one_time: once, recurring: rec,
      normalized_run_rate: run + rec, run_rate_uplift: run > 0 ? rec / run : null, it_cost_to_revenue: revenue > 0 ? (run + rec) / revenue : null,
      price_adjustment: once + 2 * rec, plan: plan, protections: protections };
  }
  return { DOMAINS: DOMAINS, CHECKS: CHECKS, SIZES: SIZES, STRENGTH: STRENGTH, CONFIDENCE: CONFIDENCE, assess: assess };
});
