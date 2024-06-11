export default function Page({ params }: { params: { _id: string } }) {
  return <div>My Post: {params._id}</div>;
}
