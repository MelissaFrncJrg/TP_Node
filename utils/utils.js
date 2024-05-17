const fs = require("fs");
const dayjs = require("dayjs");
require("dayjs/locale/fr");

function formatBirthdate(date) {
  return dayjs(date).locale("fr").format("DD/MM/YYYY");
}

async function getStudents() {
  const data = await fs.promises.readFile("./Data/students.json", "utf8");
  const jsonData = JSON.parse(data);
  console.log(jsonData);
  return jsonData.students;
}

async function addStudent(name, birth) {
  try {
    if (
      name === undefined ||
      birth === undefined ||
      !/^[a-zA-Z]+$/.test(name) ||
      !Date.parse(birth)
    ) {
      return false;
    }
    const data = await fs.promises.readFile("./Data/students.json", "utf8");
    const jsonData = JSON.parse(data);
    jsonData.students.push({ name, birth });
    await fs.promises.writeFile(
      "./Data/students.json",
      JSON.stringify(jsonData, null, 2)
    );
    return true;
  } catch (error) {
    console.log(error);
    throw new Error("Error adding student");
  }
}

async function deleteStudent(name) {
  console.log("start delete", name);
  try {
    const data = await fs.promises.readFile("./Data/students.json", "utf8");
    const jsonData = JSON.parse(data);
    const updatedStudents = jsonData.students.filter(
      (student) => student.name !== name
    );
    jsonData.students = updatedStudents;
    await fs.promises.writeFile(
      "./Data/students.json",
      JSON.stringify(jsonData, null, 2)
    );
    return true;
  } catch (error) {
    console.log(error);
    throw new Error("Error deleting student");
  }
}

module.exports = {
  formatBirthdate,
  getStudents,
  deleteStudent,
  addStudent,
};
